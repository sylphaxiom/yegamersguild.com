<?php
// Will contain $_SESSION['auth_state','environment']: bin2hex(random_bytes(32));
session_start();
if (empty($_SESSION['auth_state'])) {
    // $_SESSION['auth_state'] = 'f8dc1f86bb074ba1b52c66783fe81e54';
    $_SESSION['environment'] = 'sand';
}
// Comment out the following 3 lines for production.
error_reporting(-1);
ini_set('display_errors', 'On');
set_error_handler("var_dump");
header('Access-Control-Allow-Origin:*');
header('Access-Control-Max-Age:3600');
header('Access-Control-Allow-Headers:Content-type,Rain');
header('Access-Control-Allow-Methods:PUT,OPTIONS');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("HTTP/1.1 200 OK");
    die();
}
require_once "/home2/xikihgmy/includes/bucket.php";
require_once "SQDB_bucket.php";

require 'vendor/autoload.php';

use Square\Exceptions\SquareApiException;
use Square\SquareClient;
use Square\Environments;
use Square\OAuth\Requests\ObtainTokenRequest;

header("Content-Type: application/json");

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

/////////////////////////////////////////////////
//  Square docs OAuth API callback.php content
//  This needs to be torn apart and rebuilt
//  Must do the following:
//  - parse params returned in auth response
//  - use auth code to call OAuth to get refresh tokens
//  - manage and use access and refresh tokens
//  - encrypt the access and refresh tokens and store securely
//  - retain code_verifier & submit when ObtainToken
//  - verify the token for each API call is valid
//  - refresh access token in a timely manner
//  - use refresh token within 90 days (7 is pref)
//  - Provide seller with ability to revoke access and refresh tokens
//  - Show the permissions granted by the seller and let them manage
//  - handle errors.
/////////////////////////////////////////////////

// The obtainOAuthToken function shows you how to obtain a OAuth access token
// with the OAuth API with the authorization code returned to OAuth callback.
function obtainOAuthToken($authorizationCode)
{
    // Initialize Square PHP SDK OAuth API client.
    $clientId = Bucket::getGuildAccessToken('tP9T1eKgEqTCkkoUGTKitUzP107Hnw2KnAcEyq7KDs9qfxdYkpZBKEkfWmCJkzvf');
    $secret = Bucket::getApplicationSecret('tP9T1eKgEqTCkkoUGTKitUzP107Hnw2KnAcEyq7KDs9qfxdYkpZBKEkfWmCJkzvf');
    $environment = $_SESSION['environment'] == "sand" ? Environments::Sandbox->value : Environments::Production->value;
    $square = new SquareClient(token: $clientId, options: [
        'baseUrl' => $environment,
    ]);
    $oauthApi = $square->oAuth;
    // Initialize the request parameters for the obtainToken request.
    $body_grantType = 'authorization_code';
    $body = new ObtainTokenRequest([
        'clientId' => $clientId,
        'grantType' => $body_grantType,
        'code' => $authorizationCode,
        'clientSecret' => $secret,
    ]);

    // Call obtainToken endpoint to get the OAuth tokens.
    try {
        $response = $oauthApi->obtainToken($body);
    } catch (SquareApiException $e) {
        throw $e;
    }

    // Extract the tokens from the response.
    $accessToken = $response->getAccessToken();
    $refreshToken = $response->getRefreshToken();
    $expiresAt = $response->getExpiresAt();
    $merchantId = $response->getMerchantId();

    // Return the tokens along with the expiry date/time and merchant ID.
    return [$accessToken, $refreshToken, $expiresAt, $merchantId];
}

// Handle the response.
try {
    // Verify the state to protect against cross-site request forgery.
    // if ($_SESSION["auth_state"] !== $_GET['state']) {
    // http_response_code(404);
    // throw new Exception('There was a mismatch in the state.\nExpected: ' . $_GET['state'] . '\nFound: ' . $_SESSION['auth_state']);
    // }

    // When the response_type is "code", the seller clicked Allow
    // and the authorization page returned the auth tokens.
    if ("code" === $_GET["response_type"]) {
        // Get the authorization code and use it to call the obtainOAuthToken wrapper function.
        $authorizationCode = $_GET['code'];
        [$accessToken, $refreshToken, $expiresAt, $merchantId] = obtainOAuthToken($authorizationCode);
        // Because we want to keep things simple and we're using Sandbox, 
        // we call a function that writes the tokens to the page so we can easily copy and use them directly.
        // In production, you should never write tokens to the page. You should encrypt the tokens and handle them securely.
        // writeTokensOnSuccess($accessToken, $refreshToken, $expiresAt, $merchantId);
        //$key should have been previously generated in a cryptographically safe way, like openssl_random_pseudo_bytes
        $cipher = "aes-256-gcm";
        if (in_array($cipher, openssl_get_cipher_methods())) {
            $ivlen = openssl_cipher_iv_length($cipher);
            $iv = openssl_random_pseudo_bytes($ivlen);
            $ciphertext = openssl_encrypt($plaintext, $cipher, $key, $options = 0, $iv, $tag);
            //store $cipher, $iv, and $tag for decryption later
            // $original_plaintext = openssl_decrypt($ciphertext, $cipher, $key, OPENSSL_RAW_DATA, $iv, $tag);
            $stocked = updateDecrypt('yegamersguild', $cipher, $iv, $tag);
            if (!$stocked) {
                http_response_code(500);
                throw new Exception('An error occurred while attempting to update the decrypt database');
            } else {
                $stored = updateToken($accessToken, $refreshToken, $expiresAt, $merchantId, 'yegamersguild');
                if (!$stored) {
                    http_response_code(500);
                    throw new Exception('An error occurred while attempting to update the decrypt database');
                }
            }
        }
    } elseif ($_GET['error']) {
        // Check to see if the seller clicked the Deny button and handle it as a special case.
        if (("access_denied" === $_GET["error"]) && ("user_denied" === $_GET["error_description"])) {
            http_response_code(403);
            throw new Exception("The requested access was denied. Please contact the client");
        }
        // Display the error and description for all other errors.
        else {
            http_response_code(403);
            throw new Exception("An error occurred: {$_GET["error"]} => {$_GET["error_description"]}");
        }
    } else {
        // No recognizable parameters were returned.
        http_response_code(404);
        throw new Exception("An unknown error occurred and no recognizable parameters were returned.");
    }
} catch (Exception $e) {
    // If the obtainToken call fails, you'll fall through to here.
    http_response_code(500);
    throw new Exception("An unknown exception occurred: " . $e->getMessage());
}

?>