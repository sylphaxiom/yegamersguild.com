<?php
// Will contain $_SESSION['auth_state','environment']: bin2hex(random_bytes(32));
$session = $_GET['state'];
session_id($session);
session_start();
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

require 'vendor/autoload.php';

use Square\Exceptions\SquareApiException;
use Square\SquareClient;
use Square\Environments;
use Square\OAuth\Requests\ObtainTokenRequest;

header("Content-Type: application/json");

error_log("========== Initialized authHandle ==========");

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

/////////////////////////////////////////////////
//  Square docs OAuth API callback.php content
//  This needs to be torn apart and rebuilt
//  Must do the following:
//  - parse params returned in auth response                            +
//  - use auth code to call OAuth to get refresh tokens                 +
//  - manage and use access and refresh tokens
//  - encrypt the access and refresh tokens and store securely          +
//  - retain code_verifier & submit when ObtainToken                    +
//  - verify the token for each API call is valid
//  - refresh access token in a timely manner
//  - use refresh token within 90 days (7 is pref)
//  - Provide seller with ability to revoke access and refresh tokens
//  - Show the permissions granted by the seller and let them manage
//  - handle errors.                                                    +
/////////////////////////////////////////////////

// The obtainOAuthToken function shows you how to obtain a OAuth access token
// with the OAuth API with the authorization code returned to OAuth callback.
function obtainOAuthToken($authorizationCode)
{
    error_log("entered obtainOAuthToken with authcode $authorizationCode");
    // Initialize Square PHP SDK OAuth API client.
    $clientId = $_SESSION['clientId'];
    $environment = $_SESSION['environment'] == "sand" ? Environments::Sandbox->value : Environments::Production->value;
    $square = new SquareClient(token: $clientId, options: [
        'baseUrl' => $environment,
    ]);
    $oauthApi = $square->oAuth;
    // Initialize the request parameters for the obtainToken request.
    $verifier = $_SESSION['verifier'];
    $body = new ObtainTokenRequest([
        'clientId' => $clientId,
        'grantType' => 'authorization_code',
        'code' => $authorizationCode,
        // 'clientSecret' => $secret,
        'codeVerifier' => $verifier,
        'redirectUri' => 'https://api.sylphaxiom.com/square/authHandle.php',
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

    // Return the tokens along with the expiry date/time and merchant ID.
    return [$accessToken, $refreshToken, $expiresAt, $merchantId];
}

// Handle the response.
try {
    // Verify the state to protect against cross-site request forgery.
    if ($_SESSION["auth_state"] !== $_GET['state']) {
        http_response_code(404);
        error_log('There was a mismatch in the state.\nReturned: ' . $_GET['state'] . '\nExpected: ' . $_SESSION['auth_state']);
        exit(1);
    }

    // When the response_type is "code", the seller clicked Allow
    // and the authorization page returned the auth tokens.
    if (isset($_GET['error'])) {
        // Check to see if the seller clicked the Deny button and handle it as a special case.
        error_log("There was an error returned to callback...");
        if (("access_denied" === $_GET["error"]) && ("user_denied" === $_GET["error_description"])) {
            http_response_code(403);
            error_log("Client denied the request explicityly: " . $_GET['error_description']);
            error_log("The requested access was denied. Please contact the client");
            error_log("There was an error returned in the callback script for Square.\nError: {$_GET['error']}\nMessage: {$_GET['error_description']}\n\nPlease contact the client to see what the issue is. This error usually indicates that authorization was explicitly denied.", 1, "support@sylphaxiom.com", "From: Error Log <error@sylphaxiom.com");
            header("Location: http://localhost:5173");
            exit(1);
        }
        // Display the error and description for all other errors.
        else {
            http_response_code(403);
            error_log("The error was: " . $_GET['error'] . "\nDescribed as: " . $_GET['error_description']);
            error_log("An error occurred: {$_GET["error"]} => {$_GET["error_description"]}");
            exit(1);
        }
    } elseif (isset($_GET['response_type']) && "code" === $_GET["response_type"]) {
        error_log("code matches expected response_type, proceeding with obtainOAuthToken...");
        // Get the authorization code and use it to call the obtainOAuthToken wrapper function.
        $authorizationCode = $_GET['code'];
        try {
            [$accessToken, $refreshToken, $expiresAt, $merchantId] = obtainOAuthToken($authorizationCode);
        } catch (SquareApiException $e) {
            http_response_code(500);
            error_log("There was an error during the call to obtainToken(): " . $e->getMessage());
            error_log(var_dump($_GET));
        }
        // Because we want to keep things simple and we're using Sandbox, 
        // we call a function that writes the tokens to the page so we can easily copy and use them directly.
        // In production, you should never write tokens to the page. You should encrypt the tokens and handle them securely.
        // writeTokensOnSuccess($accessToken, $refreshToken, $expiresAt, $merchantId);
        // $key should have been previously generated in a cryptographically safe way, like openssl_random_pseudo_bytes

        error_log("Returned to the main thread, encrypting and submitting to DB...");

        $cipher = "aes-256-gcm";
        if (in_array($cipher, openssl_get_cipher_methods())) {
            error_log("Cipher present, encrypting...");
            $ivlen = openssl_cipher_iv_length($cipher);
            $iv = openssl_random_pseudo_bytes($ivlen);
            $key = Bucket::getDice();
            $cipherAccess = openssl_encrypt($accessToken, $cipher, $key, $options = 0, $iv, $tag);
            $cipherRefresh = openssl_encrypt($refreshToken, $cipher, $key, $options = 0, $iv, $tag);
            //store $cipher, $iv, and $tag for decryption later
            // $original_plaintext = openssl_decrypt($ciphertext, $cipher, $key, OPENSSL_RAW_DATA, $iv, $tag);
            $stored = updateToken(access: $cipherAccess, refresh: $cipherRefresh, expires: $expiresAt, merchantId: $merchantId, merchantName: 'yegamersguild');
            error_log("Return from updating the token table: $stored");
            if (!$stored) {
                http_response_code(500);
                error_log('An error occurred while attempting to update the decrypt database');
                exit(1);
            } else {
                $stocked = updateDecrypt(owner: 'yegamersguild', cipher: $cipher, iv: $iv, tag: $tag);
                error_log("Return from updating the decrypt table: $stocked");
                if (!$stocked) {
                    http_response_code(500);
                    error_log('An error occurred while attempting to update the decrypt database');
                    exit(1);
                } else {

                    // Tokens have been stored in the DB and user is authenticated now.
                    // 
                    header('Location: http://localhost:5173/shop');
                }
            }
        }
    } else {
        // No recognizable parameters were returned.
        http_response_code(404);
        error_log("Something went quite wrong and the response was not as expected: " . $_GET['error']);
        error_log("An unknown error occurred and no recognizable parameters were returned.");
        exit(1);
    }
} catch (Exception $e) {
    // If the obtainToken call fails, you'll fall through to here.
    http_response_code(500);
    error_log("Obtain Token failed and fell through to the bottom: " . $e->getMessage());
    error_log("An unknown exception occurred: " . $e->getMessage());
    exit(1);
}

?>