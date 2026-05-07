<?php
// Start the session with state or fail
if (empty($_COOKIE['state'])) {
    die();
} else {
    $state = $_COOKIE['state'];
}
session_id($state);
session_start();
if (!isset($_SESSION["auth_state"])) {
    http_response_code(424);
    error_log("Session was not set prior to refresh call. This is required for security.");
    die();
}

// Comment out the following 3 lines for production.
error_reporting(-1);
ini_set('display_errors', 'On');
set_error_handler("var_dump");
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Max-Age:3600');
header('Access-Control-Allow-Headers:Content-type, Authorization, Rain');
header('Access-Control-Allow-Methods:GET, POST, OPTIONS');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("HTTP/1.1 200 OK");
    die();
}
require_once "procedures.php";

header("Content-Type: application/json");

error_log("========== Initialized checker ==========");

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

if (empty($_COOKIE['token'])) {
    http_response_code(400);
    return false;
} else {
    $token = $_COOKIE['token'];
    $valid = checkToken($token);
    if ($valid) {
        http_response_code(200);
        return true;
    } else {
        http_response_code(400);
        return false;
    }
}