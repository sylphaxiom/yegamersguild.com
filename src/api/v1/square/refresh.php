<?php
// Start the session with state or fail
if (empty($_GET['state'])) {
    die();
} else {
    $state = $_GET['state'];
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
header('Access-Control-Allow-Origin:*');
header('Access-Control-Max-Age:3600');
header('Access-Control-Allow-Headers:Content-type,Rain');
header('Access-Control-Allow-Methods:GET,OPTIONS');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("HTTP/1.1 200 OK");
    die();
}
require_once "/home2/xikihgmy/includes/bucket.php";
require_once "SQDB_bucket.php";

header("Content-Type: application/json");

use Square\Exceptions\SquareApiException;
use Square\SquareClient;
use Square\Environments;
use Square\OAuth\Requests\ObtainTokenRequest;
$environment = $_SESSION['environment'] === "sand" ? Environments::Sandbox->value : Environments::Production->value;

error_log("========== Initialized refresh ==========");

// Get the current token and kickstart the auth process if it's expired or revoked.
[$access, $refresh, $expires, $merchantId, $merchantName] = getToken('yegamersguild');
// If one is set, they all are.
if (!isset($access)) {
    http_response_code(503);
    error_log('Access token is missing, unable to refresh token.');
    error_log('Notifying administrator, please reach out to the client.');
    error_log('The access token is either missing from the database, or there was an error during getToken()', 1, 'support@sylphaxiom.com', "From: Error-Log <error@sylphaxiom.com>");
    exit(1);
}

// Initialize Square PHP SDK OAuth API client.
$dice = Bucket::getDice();
$clientId = $_SESSION['clientId'];
$square = new SquareClient(token: $clientId, options: [
    'baseUrl' => $environment,
]);
$oauthApi = $square->oAuth;
// Initialize the request parameters for the obtainToken request.
$body = new ObtainTokenRequest([
    'clientId' => $clientId,
    'grantType' => 'refresh_token',
    'refreshToken' => $refresh,
    'session' => $_SESSION['environment'] === 'sand' ? true : false,
    'redirectUri' => 'https://api.sylphaxiom.com/square/refresh.php',
    'useJwt' => true,
    'shortLived' => true,
]);

// Call obtainToken endpoint to get the OAuth tokens.
try {
    error_log("Running obtainToken...");
    $response = $oauthApi->obtainToken($body);
} catch (SquareApiException $e) {
    http_response_code(500);
    error_log("A " . $e->getStatusCode() . " error was thrown while running obtainToken: " . $e->getMessage());
    exit(1);
}

// Extract the tokens from the response.
$accessToken = $response->getAccessToken();
$refreshToken = $response->getRefreshToken();
$expiresAt = $response->getExpiresAt();
$merchantId = $response->getMerchantId();

error_log("Returned to the main thread, encrypting and submitting to DB...");
saveToken(access: $accessToken, refresh: $refreshToken, merchantId: $merchantId, expires: $expiresAt, merchantName: 'yegamersguild');

?>