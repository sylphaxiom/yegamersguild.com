<?php
// CORS allowed URLs and handling 
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
    header('Access-Control-Allow-Methods:GET, POST, PUT, DELETE, OPTIONS');
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("HTTP/1.1 200 OK");
    exit;
}

// Comment out the following 2 lines for production.
error_reporting(-1);
ini_set('display_errors', 'On');


require_once "/home2/xikihgmy/includes/bucket.php";
require_once 'cms_procedures.php';
require_once 'CMSDB_bucket.php';

// Required header check
$headers = getallheaders();
$fishHead = $headers["Fish"] ?? null;
if (!isset($fishHead)) {
    http_response_code(418);
    echo "fish is not present";
    exit(1);
}
if (!Bucket::fishDance($fishHead)) {
    http_response_code(401);
    echo "fish is incorrect";
    exit(1);
}


$method = $_SERVER['REQUEST_METHOD'];

header("Content-Type: application/json");

error_log("========== Initialized content ==========");

switch ($method) {
    case 'GET':
        $contentKey = $_GET['content_key'] ?? null;
        $type = $_GET['type'] ?? null;

        switch ($type) {
            case 'text':
                $contentResult = getContent($contentKey);
                break;
            case 'image':
                $contentResult = getImages($contentKey);
                break;
            default:
                $contentResult = [];
        }
        if (!empty($contentResult)) {
            http_response_code(200);
            echo json_encode([
                'status' => "Success",
                'message' => '',
                'objects' => $contentResult,
            ]);
        } else {
            http_response_code(406);
            echo json_encode([
                'status' => 'Failure',
                'message' => "There was an error obtaining content for $contentKey. Please check your request. If you believe this is in error, contact the system administrator at support@sylphaxiom.com",
            ]);
        }
        break;
    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        break;
    case 'DELETE':
        $input = json_decode(file_get_contents('php://input'), true);
        break;
    case 'PUT':
        $input = json_decode(file_get_contents('php://input'), true);
        break;
    default:
        http_response_code(405);
        echo json_encode([
            'status' =>
                'Failure',
            'message' => 'The method used to request this resource was invalid, please try again.',
            'state' => $state
        ]);
}