<?php
// We initialize the session after getting state.
$allowed_origins = [
    'http://localhost:5173',
    'https://test.sylphaxiom.com',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age:3600');
    header('Access-Control-Allow-Headers:Content-type, Authorization');
    header('Access-Control-Allow-Methods:GET, OPTIONS');
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("HTTP/1.1 200 OK");
    exit;
}
// Comment out the following 3 lines for production.
error_reporting(-1);
ini_set('display_errors', 'On');

require_once "/home2/xikihgmy/includes/bucket.php";
require_once 'vendor/autoload.php';
require_once 'procedures.php';
// GET state and start session
$state = $_GET['state'] ?? '';
if (!$state) {
    http_response_code(418);
    error_log("State was missing from GET. Enclude state to ensure session continuity...");
    exit(1);
}
session_id($state);
session_start();
if ($_SESSION['auth_state'] != $state) {
    http_response_code(401);
    error_log("Auth state does not match current state! Check your code or you're a hacker (jerk)...");
    exit(1);
}

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);
$client = $_SESSION['clientName'];

header("Content-Type: application/json");

error_log("========== Initialized catalog ==========");

use Square\Environments;
use Square\SquareClient;
use Square\Exceptions\SquareApiException;
use Square\Catalog\Requests\ListCatalogRequest;
use Square\Types\CatalogPricingType;

switch ($method) {
    case 'GET':
        // Validate token
        $token = checkToken($client);
        // Grab request filters
        $filterTypes = 'IMAGE,ITEM,CATEGORY';
        // Grab env based URL
        $baseUrl = $_SESSION['environment'] === 'sand' ? Environments::Sandbox->value : Environments::Production->value;
        // build the client
        $sqClient = new SquareClient(token: $token, options: ['baseUrl' => $baseUrl]);
        // Make the call body
        try {
            $catalogList = $sqClient->catalog->list(
                new ListCatalogRequest([
                    'types' => $filterTypes
                ]),
            );
        } catch (SquareApiException $e) {
            // There is an error so we return failure and the error information
            error_log("A square API exception occurred while obtaining the catalog: {$e->getMessage()}");
            error_log("Additional information: {$e->getBody()}");
            http_response_code(503);
            echo json_encode(["status" => "Failure", "message" => $e->getMessage(), 'state' => $state, "error" => $e->getTraceAsString()]);
            exit(1);
        }

        $rawItems = [];
        $images = [];
        $categoryNames = [];
        try {
            foreach ($catalogList->getPages() as $page) {
                foreach ($page->getItems() as $catalogItem) {
                    if ($catalogItem->isImage()) {
                        $image = $catalogItem->asImage();
                        $images[$image->getId()] = $image->getImageData()->getUrl();
                    }
                    if ($catalogItem->isCategory()) {
                        $category = $catalogItem->asCategory();
                        $categoryNames[$category->getId()] = $category->getCategoryData()->getName();
                    }
                    if ($catalogItem->isItem()) {
                        $item = $catalogItem->asItem();
                        $rawItems[$item->getId()] = $item->getItemData();
                    }
                }
            }
        } catch (SquareApiException $e) {
            error_log("A Square API exception occurred: {$e->getMessage()}");
            error_log("Additional details: {$e->getBody()}");
            http_response_code(503);
            echo json_encode(["status" => "Failure", "message" => $e->getMessage(), 'state' => $state, "error" => $e->getTraceAsString()]);
            exit(1);
        }

        $catalogItems = [];
        // Put things together
        foreach ($rawItems as $item) {
            $imageUrls = [];
            $ids = $item->getImageIds();
            foreach ($ids as $id) {
                $imageUrls[] = $images[$id];
            }
            $categories = [];
            $categoryList = $item->getCategories();
            foreach ($categoryList as $category) {
                $categories[] = $categoryNames[$category->getId()];
            }
            $variations = [];
            $variants = $item->getVariations();
            foreach ($variants as $variant) {
                $variant = $variant->asItemVariation();
                $id = $variant->getId();
                $name = $variant->getItemVariationData()->getName();
                $sku = $variant->getItemVariationData()->getSku();
                if ($variant->getItemVariationData()->getPricingType() === CatalogPricingType::FixedPricing) {
                    $price = [
                        'amount' => $variant->getItemVariationData()->getPriceMoney()->getAmount(),
                        'currency' => $variant->getItemVariationData()->getPriceMoney()->getCurrency()
                    ];
                } else {
                    $price = 'VARIABLE_PRICE';
                }

                $variations[] = [
                    'id' => $id,
                    'name' => $name,
                    'sku' => $sku,
                    'price' => $price
                ];
            }
            $outItem = [
                'name' => $item->getName(),
                'images' => $imageUrls,
                'description' => $item->getDescriptionHtml(),
                'categories' => $categories,
                'variations' => $variations
            ];
            $catalogItems[] = $outItem;
        }
        $itemCount = count($catalogItems);

        http_response_code(200);
        echo json_encode(['status' => "Success", 'message' => '', 'state' => $state, 'count' => $itemCount, 'objects' => $catalogItems]);
        break;
    default:
        http_response_code(405);
        echo json_encode(['status' => 'Failure', 'message' => 'The method used to request this resource was invalid, please try again.', 'state' => $state]);
}