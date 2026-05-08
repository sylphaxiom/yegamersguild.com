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
    header('Access-Control-Allow-Methods:GET, POST, OPTIONS');
}

$domain = parse_url($_SERVER['HTTP_ORIGIN'], PHP_URL_HOST);

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("HTTP/1.1 200 OK");
    exit;
}
// Comment out the following 3 lines for production.
error_reporting(-1);
ini_set('display_errors', 'On');
set_error_handler("var_dump");
require_once "/home2/xikihgmy/includes/bucket.php";
require_once 'vendor/autoload.php';

header("Content-Type: application/json");

error_log("========== Initialized catalog ==========");

use Square\Environments;
use Square\SquareClient;
use Square\Exceptions\SquareApiException;
use Square\Catalog\Requests\ListCatalogRequest;

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

require_once 'procedures.php';

switch ($method) {
    case 'GET':
        // Validate token
        $token = checkToken('yegamersguild');
        // Grab request filters
        $filterTypes = $input['filter_catalogTypes'];
        // Grab env based URL
        $baseUrl = $_SESSION['environment'] === 'sand' ? Environments::Production->value : Environments::Production->value;
        // build the client
        $sqClient = new SquareClient(token: $token, options: ['baseUrl' => $baseUrl]);
        // Make the call
        try {
            $catalogList = $sqClient->catalog->list(
                new ListCatalogRequest([
                    'types' => $filterTypes
                ]),
            );
        } catch (SquareApiException $e) {
            // There is an error so we return failure and the error information
            error_log("A(n) {$e->getErrors()} exception occurred while obtaining the catalog: {$e->getMessage()}");
            error_log("Trace: {$e->getTrace()}");
            http_response_code(503);
            echo json_encode(["status" => "Failure", "message" => $e->getMessage(), 'state' => $state, "error" => $e->getTraceAsString()]);
            exit(1);
        }


        if ($catalogList) {
            // Successful call and there's data here so package and return it.
            http_response_code(200);
            echo json_encode(["status" => "Success", "message" => "Catalog list returned", 'state' => $state, 'objects' => $catalogList]);
            exit(0);
        } else {
            http_response_code(204);
            echo json_encode(['status' => 'Success', 'message' => 'The call was successful, but no information was returned.', 'state' => $state]);
        }
        break;
}