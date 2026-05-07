<?php
// We initialize the session after getting state.
$allowed_origins = [
    'http://localhost:5173',
    'https://test.sylphaxiom.com',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

// Comment out the following 3 lines for production.
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age:3600');
    header('Access-Control-Allow-Headers:Content-type, Authorization');
    header('Access-Control-Allow-Methods:GET, POST, OPTIONS');
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("HTTP/1.1 200 OK");
    exit;
}
error_reporting(-1);
ini_set('display_errors', 'On');
set_error_handler("var_dump");
require_once "/home2/xikihgmy/includes/bucket.php";

header("Content-Type: application/json");

error_log("========== Initialized gateway ==========");

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

try {
    $clientId = $_GET['clientId'];
    $state = $_GET['state'];
    $environment = $_GET['environment'];
} catch (Exception $e) {
    error_log("An error occurred while setting the clientId and state values");
    error_log("Client ID: $clientId | State: $state");
    http_response_code(400);
    echo json_encode(["status" => "Failure", "message" => $e->getMessage(), 'state' => $state, "error" => $e->getTraceAsString()]);
}



try {
    $rawHash = hash('sha256', $state, true);
    $code_challenge = rtrim(strtr(base64_encode($rawHash), '+/', '-_'), '=');
} catch (Exception $e) {
    error_log("An error occurred while hashing and converting state to code challenge.");
    error_log("Raw Hash: $rawHash | Code Challenge: $code_challenge");
    http_response_code(400);
    echo json_encode(["status" => "Failure", "message" => $e->getMessage(), 'state' => $state, "error" => $e->getTraceAsString()]);
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
    echo json_encode(["status" => "Failure", "message" => $e->getMessage(), 'state' => $state, "error" => $e->getTraceAsString()]);
}
require_once "procedures.php";

// Always send to refresh to check for a current token with state in the URL for GET
// Assume if you get a echo then you are authorized and can proceed.
try {
    $token = loadToken(client: 'yegamersguild');
    error_log("token returned from the load is: $token");
} catch (Exception $e) {
    error_log("An error occurred while loading the token and setting it in the session.");
    error_log("Message: " . $e->getMessage() . " | Trace:\n" . $e->getLine());
    http_response_code(400);
    echo json_encode(["status" => "Failure", "message" => $e->getMessage(), 'state' => $state, "error" => $e->getTraceAsString()]);
}
$_SESSION['expires'] = (new DateTime())->add(DateInterval::createFromDateString('2 hours'));
$_SESSION['validator'] = $code_challenge;

try {
    $key = hash('sha256', Bucket::getDice(), true);
    $cipher = "aes-256-gcm";
    $ivlen = openssl_cipher_iv_length($cipher);
    $iv = openssl_random_pseudo_bytes($ivlen);
    $encToken = openssl_encrypt($token, $cipher, $key, OPENSSL_RAW_DATA, $iv, $tag);
    error_log("token after encryption is: $encToken");
    $_SESSION['tag'] = $tag;
    $_SESSION['iv'] = $iv;
    $_SESSION["token"] = $encToken;
} catch (Exception $e) {
    error_log("An error occurred while doing the final session load and token encryption.");
    http_response_code(400);
    echo json_encode(["status" => "Failure", "message" => $e->getMessage(), 'state' => $state, "error" => $e->getTraceAsString()]);
}

error_log("Gateway completed, returning cookie and authorized...");
$cookieData = ['state' => $state, 'token' => $encToken];
setCookie(name: $state, value: json_encode($cookieData), expires_or_options: (time() + 7200), path: "", domain: $_SERVER['HTTP_ORIGIN'], secure: true, httponly: true);

http_response_code(200);
echo json_encode(['status' => "Authorized", 'message' => 'Authorization valid for 2 hours.', 'state' => $state, 'token' => $encToken]);