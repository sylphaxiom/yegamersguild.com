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
require_once "/home2/xikihgmy/includes/bucket.php";
require_once "SQDB_bucket.php";

require 'vendor/autoload.php';

use Square\Exceptions\SquareApiException;
use Square\SquareClient;
use Square\Environments;
use Square\OAuth\Requests\ObtainTokenRequest;

header("Content-Type: application/json");

error_log("========== Initialized gateway ==========");

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

$clientId = $input['clientId'];
$state = $input['state'];

$environment = "sand";

$rawHash = hash('sha256', $state, true);
$code_challenge = rtrim(strtr(base64_encode($rawHash), '+/', '-_'), '=');

session_id($state);
session_start();
$_SESSION['clientId'] = $clientId;
$_SESSION['auth_state'] = $state;
$_SESSION['environment'] = $environment;

// Always send to refresh to check for a current token with state in the URL for GET