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
    header('Access-Control-Allow-Methods:GET, PUT, POST, DELETE, OPTIONS');
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
require_once 'EVNTDB_bucket.php';

// Required header check
$headers = getallheaders();
$fishHead = $headers["Fish"] ?? $_SERVER['HTTP_FISH'] ?? null;
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

error_log("========== Initialized events ==========");

switch ($method) {
    case 'GET':
        error_log("Getting all events...");
        $contentResult = getAllEvents();
        http_response_code(200);
        echo json_encode([
            'status' => "Success",
            'message' => '',
            'objects' => $contentResult,
        ]);
        break;
    case 'POST':
        requireAuth($tokenHead);
        error_log("Authenticated and adding event content...");
        $input = json_decode(file_get_contents('php://input'), true);
        $title = $input['title'] ?? null;
        $description = $input['description'] ?? null;
        $start_datetime = $input['start_datetime'] ?? null;
        $end_datetime = $input['end_datetime'] ?? null;
        $all_day = $input['all_day'] ?? false;
        if (!$title || !$start_datetime) {
            error_log("title or start_datetime were missing. Values are: $title | $start_datetime");
            http_response_code(400);
            echo json_encode([
                'status' => 'Failure',
                'message' => 'The title or start time were missing from the request body.',
            ]);
            exit(1);
        }
        $result = putEvent($title, $description, $start_datetime, $end_datetime, $all_day);
        if (!$result) {
            error_log("putEvent returned false, there was an error in the DB transaction...");
            http_response_code(406);
            echo json_encode([
                'status' => 'Failure',
                'message' => "There was an error adding the $title event. Please check your request. If you believe this is in error, contact the system administrator at support@sylphaxiom.com",
            ]);
            exit(1);
        }
        http_response_code(200);
        echo json_encode([
            "status" => "Success",
            "message" => "Event: $title has been added successfully."
        ]);
        break;
    case 'PUT':
        requireAuth($tokenHead);
        error_log("Authenticated and updating event content...");
        $input = json_decode(file_get_contents('php://input'), true);
        $id = (int) ($input['id'] ?? 0);
        $title = $input['title'] ?? null;
        $description = $input['description'] ?? null;
        $start_datetime = $input['start_datetime'] ?? null;
        $end_datetime = $input['end_datetime'] ?? null;
        $all_day = $input['all_day'] ?? false;
        if (!$id || !$title || !$start_datetime) {
            error_log("id, title, or start_datetime were missing. Values are: $id | $title | $start_datetime");
            http_response_code(400);
            echo json_encode([
                'status' => 'Failure',
                'message' => 'The id, title, or start time were missing from the request body.',
            ]);
            exit(1);
        }
        $result = updateEvent($id, $title, $description, $start_datetime, $end_datetime, $all_day);
        if (!$result) {
            error_log("updateEvent returned false, there was an error in the DB transaction...");
            http_response_code(406);
            echo json_encode([
                'status' => 'Failure',
                'message' => "There was an error updating the $title event. Please check your request. If you believe this is in error, contact the system administrator at support@sylphaxiom.com",
            ]);
            exit(1);
        }
        http_response_code(200);
        echo json_encode([
            "status" => "Success",
            "message" => "Event: $title has been updated successfully."
        ]);
        break;
    case 'DELETE':
        requireAuth($tokenHead);
        error_log("Authenticated and deleting event content...");
        $input = json_decode(file_get_contents('php://input'), true);
        $id = (int) ($input['id'] ?? 0);
        if (!$id) {
            error_log("id is missing. Values are: $id");
            http_response_code(400);
            echo json_encode([
                'status' => 'Failure',
                'message' => 'The id was missing from the request body and is required to delete an event.',
            ]);
            exit(1);
        }
        $return = deleteEvent($id);
        if (!$return) {
            error_log("deleteEvent returned false, there was an error in the DB transaction...");
            http_response_code(500);
            echo json_encode([
                "status" => "Failure",
                "message" => "There was an error while removing the event."
            ]);
            exit(1);
        }
        http_response_code(200);
        echo json_encode([
            'status' => 'Success',
            'message' => "The event with id $id was deleted successfully."
        ]);
        break;
    default:
        error_log("Default statement reached, the method was invalid...");
        http_response_code(405);
        echo json_encode([
            'status' =>
                'Failure',
            'message' => 'The method used to request this resource was invalid, please try again.',
        ]);
}