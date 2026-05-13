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
    error_log("An error occurred while reading clientId, state, or environment from request.");
    http_response_code(400);
    echo json_encode(["status" => "Failure", "message" => $e->getMessage(), 'state' => $state, "error" => $e->getTraceAsString()]);
}
error_log("GET values clientId, state, and environment obtained...");

try {
    $rawHash = hash('sha256', $state, true);
    $code_challenge = rtrim(strtr(base64_encode($rawHash), '+/', '-_'), '=');
} catch (Exception $e) {
    error_log("An error occurred while generating the code challenge.");
    http_response_code(400);
    echo json_encode(["status" => "Failure", "message" => $e->getMessage(), 'state' => $state, "error" => $e->getTraceAsString()]);
}
error_log("Code Challenge has been built and parsed...");


session_id($state);
session_start();
try {
    $_SESSION['clientId'] = $clientId;
    $_SESSION['auth_state'] = $state;
    $_SESSION['environment'] = $environment;
    $client = 'yegamersguild';
    $_SESSION['clientName'] = $client;
} catch (Exception $e) {
    error_log("An error occurred while setting session variables clientId, auth_state, and environment.");
    http_response_code(400);
    echo json_encode(["status" => "Failure", "message" => $e->getMessage(), 'state' => $state, "error" => $e->getTraceAsString()]);
}
error_log("Session has been initialized and values clientId, auth_state, and environment have been set.");
require_once "procedures.php";

// Always send to refresh to check for a current token with state in the URL for GET
// Assume if you get a echo then you are authorized and can proceed.
try {
    $token = loadToken($client);
} catch (Exception $e) {
    error_log("An error occurred while loading the token and setting it in the session.");
    error_log("Message: " . $e->getMessage() . " | Trace:\n" . $e->getLine());
    http_response_code(400);
    echo json_encode(["status" => "Failure", "message" => $e->getMessage(), 'state' => $state, "error" => $e->getTraceAsString()]);
}
$_SESSION['expires'] = (new DateTime())->add(DateInterval::createFromDateString('2 hours'));
$_SESSION['verifier'] = $code_challenge;
error_log("Token has been loaded...");

try {
    $key = hash('sha256', Bucket::getDice(), true);
    $cipher = "aes-256-gcm";
    $ivlen = openssl_cipher_iv_length($cipher);
    $iv = openssl_random_pseudo_bytes($ivlen);
    $encToken = base64_encode(openssl_encrypt($token, $cipher, $key, OPENSSL_RAW_DATA, $iv, $tag));
    $_SESSION['tag'] = $tag;
    $_SESSION['iv'] = $iv;
} catch (Exception $e) {
    error_log("An error occurred while doing the final session load and token encryption.");
    http_response_code(400);
    echo json_encode(["status" => "Failure", "message" => $e->getMessage(), 'state' => $state, "error" => $e->getTraceAsString()]);
}
error_log("Token re-encrypted for frontend drop...");

$cookieData = ['state' => $state, 'token' => $encToken];
setCookie('snickerdoodle', json_encode($cookieData), [
    'expires' => (time() + 7200),
    'path' => "/",
    'secure' => true,
    'httponly' => true,
    'samesite' => 'None'
]);
error_log("Authorized and returning to client...");
http_response_code(200);
echo json_encode(['status' => "Authorized", 'message' => 'Authorization valid for 2 hours.', 'state' => $state, 'token' => $encToken]);