<?php
// We initialize the session after getting state.

// Comment out the following 3 lines for production.
error_reporting(-1);
ini_set('display_errors', 'On');
set_error_handler("var_dump");
header('Access-Control-Allow-Origin:*');
header('Access-Control-Max-Age:3600');
header('Access-Control-Allow-Headers:Content-type,Rain');
header('Access-Control-Allow-Methods:GET,OPTIONS');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("HTTP/1.1 200 OK");
    die();
}
// require_once "/home2/xikihgmy/includes/bucket.php";
// require_once "SQDB_bucket.php";

// require 'vendor/autoload.php';

header("Content-Type: application/json");

error_log("========== Initialized gateway ==========");

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

try {
    $clientId = $input['clientId'];
    $state = $input['state'];
} catch (Exception $e) {
    error_log("An error occurred while setting the clientId and state values");
    error_log("Client ID: $clientId | State: $state");
    http_response_code(400);
    return json_encode(["status" => "Failure", "error" => $e->getMessage(), "trace" => $e->getTraceAsString()]);
}


$environment = "sand";

try {
    $rawHash = hash('sha256', $state, true);
    $code_challenge = rtrim(strtr(base64_encode($rawHash), '+/', '-_'), '=');
} catch (Exception $e) {
    error_log("An error occurred while hashing and converting state to code challenge.");
    error_log("Raw Hash: $rawHash | Code Challenge: $code_challenge");
    http_response_code(400);
    return json_encode(["status" => "Failure", "error" => $e->getMessage(), "trace" => $e->getTraceAsString()]);
}


session_id($state);
session_start();
try {
    $_SESSION['clientId'] = $clientId;
    $_SESSION['auth_state'] = $state;
    $_SESSION['environment'] = $environment;
} catch (Exception $e) {
    error_log("An error occurred while setting session variables clientId, auth_state, and environment.");
    error_log("Client ID: {$_SESSION['clientId']} | State: {$_SESSION['auth_state']} | Environment: {$_SESSION['environment']}");
    http_response_code(400);
    return json_encode(["status" => "Failure", "error" => $e->getMessage(), "trace" => $e->getTraceAsString()]);
}


// Always send to refresh to check for a current token with state in the URL for GET
// Assume if you get a return then you are authorized and can proceed.
try {
    $token = loadToken('yegamersguild');
    $_SESSION['token'] = $token;
    $_SESSION['expires'] = (new DateTime())->add(DateInterval::createFromDateString('2 hours'));
} catch (Exception $e) {
    error_log("An error occurred while loading the token and setting it in the session.");
    http_response_code(400);
    return json_encode(["status" => "Failure", "error" => $e->getMessage(), "trace" => $e->getTraceAsString()]);
}

http_response_code(200);
return json_encode(['status' => "Authorized", 'message' => 'Authorization valid for 2 hours.']);