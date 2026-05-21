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
    header('Access-Control-Allow-Headers:Content-type, Authorization, Fish');
    header('Access-Control-Allow-Methods:GET, PUT, OPTIONS');
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
$tokenHead = $headers["Authorization"] ?? null;
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
        $content_key = $_GET['content_key'] ?? null;
        if (empty($content_key)) {
            $contentResult = getAllContent();
            http_response_code(200);
            echo json_encode([
                'status' => "Success",
                'message' => '',
                'objects' => $contentResult,
            ]);
        } else {
            $contentResult = getContent($content_key);
            http_response_code(200);
            echo json_encode([
                'status' => 'Success',
                'message' => '',
                'objects' => $contentResult,
            ]);
        }
        break;
    case 'PUT':
        $input = json_decode(file_get_contents('php://input'), true);
        initSession();
        requireAuth($fishHead, $tokenHead);

        $value = $input['value'] ?? null;
        $label = $input['label'] ?? null;
        $content_key = $_GET['content_key'] ?? null;

        if (!$value || !$label || !$content_key) {
            http_response_code(400);
            echo json_encode([
                'status' => 'Failure',
                'message' => 'The request was missing some parameters. Please check that all the required data is being sent in the request as it seems something was missing.',
            ]);
            exit;
        }

        $putResult = putContent($value, $label, $content_key);
        if ($putResult) {
            http_response_code(200);
            echo json_encode([
                'status' => "Success",
                'message' => "Content for $content_key has been successfully updated.",
            ]);
        } else {
            http_response_code(406);
            echo json_encode([
                'status' => 'Failure',
                'message' => "There was an error updating content for $content_key. Please check your request. If you believe this is in error, contact the system administrator at support@sylphaxiom.com",
            ]);
        }
        break;
    default:
        http_response_code(405);
        echo json_encode([
            'status' =>
                'Failure',
            'message' => 'The method used to request this resource was invalid, please try again.',
        ]);
}