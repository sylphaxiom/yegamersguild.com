<?php
session_start();

require 'vendor/autoload.php';
require_once('messages.php');

use Square\Exceptions\ApiException;
use Square\SquareClient;
use Square\Environment;
use Square\Models\ObtainTokenRequest;

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
$headers = apache_request_headers();
$dropError = <<<HTML
        <html>
            <div style="display:flex; flex-direction: column; padding-horizontal:auto; align-items:center;">
                <div class="tenor-gif-embed" data-postid="9628120" data-share-method="host" data-aspect-ratio="1.55" data-width="25%"><a href="https://tenor.com/view/jurassic-park-ah-you-didnt-say-the-magic-word-say-please-gif-9628120">Jurassic Park Ah GIF</a>from <a href="https://tenor.com/search/jurassic+park-gifs">Jurassic Park GIFs</a></div> <script type="text/javascript" async src="https://tenor.com/embed.js"></script>
                <h1>Oops! Looks like you F****d that right up!</h1>
                <h2>Your request header was missing some stuff!</h2>
            </div>
        </html>
    HTML;
$rainHead = $headers["Rain"];
if (!isset($rainHead)) {
    http_response_code(401);
    echo "rain is not present";
    exit(1);
}
if (!Bucket::rainDance($rainHead)) {
    http_response_code(401);
    echo "rain is incorrect";
    exit(1);
}


// connect to the DB
$conn = Bucket::dbConn("oauth", "yeguild");

header("Content-Type: application/json");

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

/////////////////////////////////////////////////
//  Square docs OAuth API callback.php content
//  This needs to be torn apart and rebuilt
/////////////////////////////////////////////////

// The obtainOAuthToken function shows you how to obtain a OAuth access token
// with the OAuth API with the authorization code returned to OAuth callback.
function obtainOAuthToken($authorizationCode)
{
    // Initialize Square PHP SDK OAuth API client.
    $environment = $_ENV['SQ_ENVIRONMENT'] == "sandbox" ? Environment::SANDBOX : Environment::PRODUCTION;
    $apiClient = new SquareClient([
        'environment' => $environment,
        'userAgentDetail' => "sample_app_oauth_php" // Remove or replace this detail when building your own app
    ]);
    $oauthApi = $apiClient->getOAuthApi();
    // Initialize the request parameters for the obtainToken request.
    $body_grantType = 'authorization_code';
    $body = new ObtainTokenRequest(
        $_ENV['SQ_APPLICATION_ID'],
        $body_grantType
    );
    $body->setCode($authorizationCode);
    $body->setClientSecret($_ENV['SQ_APPLICATION_SECRET']);

    // Call obtainToken endpoint to get the OAuth tokens.
    try {
        $response = $oauthApi->obtainToken($body);

        if ($response->isError()) {
            $code = $response->getErrors()[0]->getCode();
            $category = $response->getErrors()[0]->getCategory();
            $detail = $response->getErrors()[0]->getDetail();

            throw new Exception("Error Processing Request: obtainToken failed!\n" . $code . "\n" . $category . "\n" . $detail, 1);
        }
    } catch (ApiException $e) {
        error_log($e->getMessage());
        error_log($e->getHttpResponse()->getRawBody());
        throw new Exception("Error Processing Request: obtainToken failed!\n" . $e->getMessage() . "\n" . $e->getHttpResponse()->getRawBody(), 1);
    }

    // Extract the tokens from the response.
    $accessToken = $response->getResult()->getAccessToken();
    $refreshToken = $response->getResult()->getRefreshToken();
    $expiresAt = $response->getResult()->getExpiresAt();
    $merchantId = $response->getResult()->getMerchantId();

    // Return the tokens along with the expiry date/time and merchant ID.
    return array($accessToken, $refreshToken, $expiresAt, $merchantId);
}

// Handle the response.
try {
    // Verify the state to protect against cross-site request forgery.
    if ($_SESSION["auth_state"] !== $_GET['state']) {
        displayStateError();
        return;
    }

    // When the response_type is "code", the seller clicked Allow
    // and the authorization page returned the auth tokens.
    if ("code" === $_GET["response_type"]) {
        // Get the authorization code and use it to call the obtainOAuthToken wrapper function.
        $authorizationCode = $_GET['code'];
        list($accessToken, $refreshToken, $expiresAt, $merchantId) = obtainOAuthToken($authorizationCode);
        // Because we want to keep things simple and we're using Sandbox, 
        // we call a function that writes the tokens to the page so we can easily copy and use them directly.
        // In production, you should never write tokens to the page. You should encrypt the tokens and handle them securely.
        writeTokensOnSuccess($accessToken, $refreshToken, $expiresAt, $merchantId);
    } elseif ($_GET['error']) {
        // Check to see if the seller clicked the Deny button and handle it as a special case.
        if (("access_denied" === $_GET["error"]) && ("user_denied" === $_GET["error_description"])) {
            displayError("Authorization denied", "You chose to deny access to the app.");
        }
        // Display the error and description for all other errors.
        else {
            displayError($_GET["error"], $_GET["error_description"]);
        }
    } else {
        // No recognizable parameters were returned.
        displayError("Unknown parameters", "Expected parameters were not returned");
    }
} catch (Exception $e) {
    // If the obtainToken call fails, you'll fall through to here.
    displayError("Exception", $e->getMessage());
}

?>