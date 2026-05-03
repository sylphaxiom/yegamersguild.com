<?php
// Will contain $_SESSION['auth_state','environment']: bin2hex(random_bytes(32));
$state = bin2hex(random_bytes(16));
session_id($state);
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

header("Content-Type: application/json");

error_log("========== Initialized callback ==========");

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

if ($method === 'GET') {
    $client_id = Bucket::getGuildApplicationId('tP9T1eKgEqTCkkoUGTKitUzP107Hnw2KnAcEyq7KDs9qfxdYkpZBKEkfWmCJkzvf');
    $scope = 'INVENTORY_READ+INVENTORY_WRITE+ITEMS_READ+ITEMS_WRITE';
    $verifier = bin2hex(random_bytes(32));
    $rawHash = hash('sha256', $verifier, true);
    $code_challenge = rtrim(strtr(base64_encode($rawHash), '+/', '-_'), '=');

    // Now you save $verifier to your session and send $code_challenge to Square!

    // Set session variables and build URL
    $_SESSION['auth_state'] = $state;
    $_SESSION['environment'] = 'sand';
    $_SESSION['verifier'] = $verifier;

    $authURL = "https://connect.squareupsandbox.com/oauth2/authorize?client_id=$client_id&scope=$scope&state=$state&code_challenge=$code_challenge";
    error_log("Authorization URL has been constructed: $authURL\nSession variables are:\nauth_state: {$_SESSION['auth_state']}\nenvironment: {$_SESSION['environment']}\nverifier: {$_SESSION['verifier']}");
    http_response_code(200);
    echo $authURL;
}