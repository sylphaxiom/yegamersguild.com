<?php
require_once "/home2/xikihgmy/includes/bucket.php";

header("Content-Type: application/json");

error_log("========== Running kicker ==========");

use Square\Environments;

$environment = $_SESSION["environment"] === 'sand' ? Environments::Sandbox->value : Environments::Production->value;
$session = $_SESSION["environment"] === 'sand' ? true : false;

$client_id = $_SESSION['clientId'];
$scope = 'INVENTORY_READ+INVENTORY_WRITE+ITEMS_READ+ITEMS_WRITE';
$verifier = $_SESSION['state'];
$rawHash = hash('sha256', $verifier, true);
$code_challenge = rtrim(strtr(base64_encode($rawHash), '+/', '-_'), '=');

// Now you save $verifier to your session and send $code_challenge to Square!
// Set session variables and build URL
$_SESSION['auth_state'] = $state;
$_SESSION['environment'] = 'sand';
$_SESSION['verifier'] = $verifier;

$authURL = "$environment/oauth2/authorize?client_id=$client_id&scope=$scope&session=$session&state=$state&code_challenge=$code_challenge";
return header("Location: $authURL");