<?php
require_once "/home2/xikihgmy/includes/bucket.php";
require_once "SQDB_bucket.php";

///////////////////////////////////////////////////////////////////////////////
// These functions will do whatever operations need to be done between DB 
// operations like fetching and saving the tokens or whatever other data
// needs to be scribbed and have the same set of procedures run on it.
// Basically anything that will take more than 1 function to do, that needs
// to be done repeatedly, put them here so steps aren't missed. Then you just
// need to call the operation, not all the steps. Removes some bucket deps.
///////////////////////////////////////////////////////////////////////////////

error_log("========== Initialized procedures ==========");

function loadToken(string $client)
{
    // Get data
    error_log("Entered loadToken with client: $client");
    try {
        $results = getToken(client: $client);
        if ($results === false) {
            error_log("No token data present, initializing kicker...");
            require 'kicker.php';
            exit();
        }
        [$access, $refresh, $expires, $merchantId, $merchantName] = $results;
        error_log("inside loadToken, token row retrieved from DB.");
    } catch (Exception $e) {
        error_log("An error occurred in loadToken while running getToken.");
        error_log("Message: " . $e->getMessage() . " | Trace:\n" . $e->getLine());
        throw $e;
    }
    try {
        $results = getDecrypt(client: $client);
        if ($results === false) {
            error_log("FATAL: Token exists but decrypt data is missing for $client. DB is in inconsistent state.");
            http_response_code(500);
            echo json_encode(["status" => "Error", "message" => "Internal server error."]);
            exit(1);
        }
        [$cipher, $a_iv, $r_iv, $a_tag, $r_tag] = $results;
        $a_iv = base64_decode($a_iv);
        $r_iv = base64_decode($r_iv);
        $a_tag = base64_decode($a_tag);
        $r_tag = base64_decode($r_tag);
    } catch (Exception $e) {
        error_log("An error occurred in loadToken while running getDecrypt.");
        error_log("Message: " . $e->getMessage() . " | Trace:\n" . $e->getLine());
        throw $e;
    }
    error_log("Token and cipher loaded for client: $client.");
    $key = hash('sha256', Bucket::getDice(), true);
    // decrypt tokens
    try {
        $decAccess = openssl_decrypt(base64_decode($access), $cipher, $key, OPENSSL_RAW_DATA, $a_iv, $a_tag);
        $decRefresh = openssl_decrypt(base64_decode($refresh), $cipher, $key, OPENSSL_RAW_DATA, $r_iv, $r_tag);
        error_log("Token decrypted successfully for client: $client.");
    } catch (Exception $e) {
        error_log("An error occurred in loadToken while running decryption.");
        error_log("Message: " . $e->getMessage() . " | Trace:\n" . $e->getLine());
        throw $e;
    }
    // Check expiration date
    $exp = new DateTime($expires);
    $now = new DateTime();
    if (($now >= $exp) || ($now->diff($exp)->days <= 20)) {
        error_log("Token is expired or nearing expiration in " . $now->diff($exp)->days . " days");
        error_log("Initializing refresh to obtain a new token...");
        require_once 'refresh.php';
        exit(1);
    }
    // return CLIENT USABLE token/data
    return $decAccess;
}

function saveToken(string $access, string $refresh, string $expires, string $merchantId, string $merchantName)
{
    $results = getDecrypt(client: $merchantName);
    if ($results === false) {
        error_log("No decryption data present, building...");
        $cipher = "aes-256-gcm";
        $ivlen = openssl_cipher_iv_length($cipher);
        $a_iv = openssl_random_pseudo_bytes($ivlen);
        $r_iv = openssl_random_pseudo_bytes($ivlen);
        $a_tag = '';
        $r_tag = '';
    } else {
        [$cipher, $a_iv, $r_iv, $a_tag, $r_tag] = $results;
        $a_iv = base64_decode($a_iv);
        $r_iv = base64_decode($r_iv);
        $a_tag = base64_decode($a_tag);
        $r_tag = base64_decode($r_tag);
    }

    $key = hash('sha256', Bucket::getDice(), true);
    $encAccess = base64_encode(openssl_encrypt($access, $cipher, $key, OPENSSL_RAW_DATA, $a_iv, $a_tag));
    $encRefresh = base64_encode(openssl_encrypt($refresh, $cipher, $key, OPENSSL_RAW_DATA, $r_iv, $r_tag));
    // Check if inputs are empty or wrong type
    if (!empty($encAccess) && !empty($encRefresh)) {
        $enca_iv = base64_encode($a_iv);
        $encr_iv = base64_encode($r_iv);
        $enca_tag = base64_encode($a_tag);
        $encr_tag = base64_encode($r_tag);
        $tknRes = updateToken(access: $encAccess, refresh: $encRefresh, expires: $expires, merchantId: $merchantId, merchantName: $merchantName);
        $decRes = updateDecrypt(owner: $merchantName, cipher: $cipher, a_iv: $enca_iv, r_iv: $encr_iv, a_tag: $enca_tag, r_tag: $encr_tag);
        if (empty($tknRes)) {
            error_log("An error occurred while updating the token in the database.");
            exit(1);
        }
        if (empty($decRes)) {
            error_log("An error occurred while updating the decryption in the database.");
            exit(1);
        }
        error_log("saveToken completed successfully.");
        return true;
    } else {
        error_log("openssl_encrypt failed. encAccess empty: " . empty($encAccess) . " | encRefresh empty: " . empty($encRefresh));
        error_log("OpenSSL error: " . openssl_error_string());
        exit(1);
    }
}

function checkToken(string $token)
{
    $ogToken = loadToken('yegamersguild');
    try {
        $e_tag = $_SESSION['tag'];
        $iv = $_SESSION['iv'];
    } catch (Exception $e) {
        error_log('An error occurred while getting the decrypt info for the public token, check your session.');
        error_log("Session keys present: " . implode(", ", array_keys($_SESSION)));
    }
    $cipher = "aes-256-gcm";
    $key = hash('sha256', Bucket::getDice(), true);
    $newToken = openssl_decrypt($token, $cipher, $key, OPENSSL_RAW_DATA, $iv, $e_tag);

    return $ogToken === $newToken;
}