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

$cookieData = $_COOKIE['snickerdoodle'];
$cookie = [];
parse_str($cookieData, $cookie);
error_log("Checking token validity...");

if (empty($cookie['token'])) {
    http_response_code(400);
    return false;
} else {
    $valid = checkToken($client);
    if ($valid) {
        http_response_code(200);
        error_log("['status' => 'Authorized', 'message' => 'Authorization valid for 2 hours.', 'state' => $state]");
        echo json_encode(['status' => 'Authorized', 'message' => 'Authorization valid for 2 hours.', 'state' => $state]);
        exit;
    } else {
        http_response_code(401);
        error_log("['status' => 'Failure', 'message' => 'Invalid token sent with request.', 'state' => $state]");
        echo json_encode(['status' => "Failure", 'message' => 'Invalid token sent with request.', 'state' => $state]);
        exit;
    }
}