<?php

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
use Square\OAuth\Requests\RevokeTokenRequest;
$environment = Environments::Sandbox->value;
$revokeAccessOnly = false;

error_log("========== Initialized refresh ==========");

// Get the current token and kickstart the auth process if it's expired or revoked.
[$access, $refresh, $expires, $merchantId, $merchantName] = getToken();
// If one is set, they all are.
if (!isset($access)) {
    http_response_code(503);
    error_log('Access token is missing, unable to refresh token.');
    error_log('Notifying administrator, please reach out to the client.');
    error_log('The access token is either missing from the database, or there was an error during getToken()', 1, 'support@sylphaxiom.com', "From: Error-Log");
    exit(1);
}

// Initialize Square PHP SDK OAuth API client.
$dice = Bucket::getDice();
$clientId = Bucket::getGuildApplicationId($dice);
$square = new SquareClient(token: $clientId, options: [
    'baseUrl' => $environment,
]);
$oauthApi = $square->oAuth;
// Initialize the request parameters for the RevokeToken request.
$body = new RevokeTokenRequest([
    'clientId' => $clientId,
    'grantType' => 'refresh_token',
    'refreshToken' => $refresh,
    'redirectUri' => 'https://api.sylphaxiom.com/square/refresh.php',
    'revokeOnlyAccessToken' => $revokeAccessOnly
]);

// Call obtainToken endpoint to get the OAuth tokens.
try {
    error_log("Running obtainToken...");
    $response = $oauthApi->revokeToken($body);
} catch (SquareApiException $e) {
    http_response_code(500);
    error_log("A " . $e->getStatusCode() . " error was thrown while running obtainToken: " . $e->getMessage());
    exit(1);
}

// Extract the tokens from the response.
error_log('!!!WARNING!!! - Your access token has been revoked by the client. If this is unexpected, please reach out to the client and see what the issue is.', 1, 'administrator@sylphaxiom.com', 'From: Error Log <error@sylphaxiom.com>');

// Return the tokens along with the expiry date/time and merchant ID.
dropToken(merchantName: 'yegamersguild');

?>