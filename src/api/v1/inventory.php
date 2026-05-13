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

error_log("========== Initialized inventory ==========");

use Square\Environments;
use Square\SquareClient;
use Square\Exceptions\SquareApiException;
use Square\Types\BatchGetInventoryCountsRequest;

// Validate token
$token = checkToken($client);
// Grab env based URL
$baseUrl = $_SESSION['environment'] === 'sand' ? Environments::Sandbox->value : Environments::Production->value;
// build the client
$sqClient = new SquareClient(token: $token, options: ['baseUrl' => $baseUrl]);
if (!isset($_SESSION['locationId'])) {
    try {
        $locations = $sqClient->locations->list()->getLocations();
        if (empty($locations)) {
            http_response_code(400);
            error_log('No locations returned from Square...');
            echo json_encode(['status' => "Failure", 'message' => 'No locations found.', 'state' => $state]);
            exit(1);
        }
        $_SESSION['locationId'] = $locations[0]->getId();
        error_log("Location information: " . $_SESSION["locationId"]);
    } catch (SquareApiException $e) {
        error_log("Square API exception getting locations: {$e->getMessage()}");
        error_log("Body: {$e->getBody()}");
        http_response_code(503);
        echo json_encode(['status' => "Failure", 'message' => $e->getMessage(), 'state' => $state]);
        exit(1);
    }
}
$locationId = $_SESSION['locationId'];

switch ($method) {
    case 'GET':
        // Get Variation IDs from the GET
        $variationIds = explode(',', $_GET['variationIds'] ?? '');
        if (empty($variationIds[0])) {
            http_response_code(400);
            error_log('No variation IDs were included in the request...');
            echo json_encode(['status' => "Failure", 'message' => 'There were no variantion IDs included in the request. You must include a variation ID if you want to know it\'s inventory status.', 'state' => $state]);
            exit(1);
        }
        // Make the call body
        try {
            error_log("Environment from session: " . $_SESSION['environment']);
            error_log("Base URL: " . $baseUrl);

            $response = $sqClient->inventory->batchGetCounts(new BatchGetInventoryCountsRequest([
                'locationIds' => [$locationId],
                'catalogObjectIds' => $variationIds,
                'states' => ['IN_STOCK']
            ]));
        } catch (SquareApiException $e) {
            error_log("Square API exception: {$e->getMessage()}");
            error_log("Body: {$e->getBody()}");
            http_response_code(503);
            echo json_encode(["status" => "Failure", "message" => $e->getMessage(), 'state' => $state]);
            exit(1);
        } catch (\Throwable $e) {
            error_log("Throwable (" . get_class($e) . "): {$e->getMessage()}");
            http_response_code(500);
            echo json_encode(["status" => "Failure", "message" => $e->getMessage(), 'state' => $state]);
            exit(1);
        }



        $counts = [];
        try {
            foreach ($response->getPages() as $page) {
                foreach ($page->getItems() as $inventory) {
                    $varId = $inventory->getCatalogObjectId();
                    $quantity = (int) $inventory->getQuantity();
                    $counts[$varId] = $quantity;
                }
            }
        } catch (SquareApiException $e) {
            error_log("A Square API exception occurred: {$e->getMessage()}");
            error_log("Additional details: {$e->getBody()}");
            http_response_code(503);
            echo json_encode(["status" => "Failure", "message" => $e->getMessage(), 'state' => $state]);
            exit(1);
        } catch (\Throwable $e) {
            error_log("Throwable (" . get_class($e) . "): {$e->getMessage()}");
            http_response_code(500);
            echo json_encode(["status" => "Failure", "message" => $e->getMessage(), 'state' => $state]);
            exit(1);
        }


        $total = count($counts);
        // Return 200 and the response output.
        http_response_code(200);
        echo json_encode(['status' => "Success", 'message' => '', 'state' => $state, 'count' => $total, 'objects' => $counts]);
        break;
    default:
        http_response_code(405);
        echo json_encode(['status' => 'Failure', 'message' => 'The method used to request this resource was invalid, please try again.', 'state' => $state]);
}