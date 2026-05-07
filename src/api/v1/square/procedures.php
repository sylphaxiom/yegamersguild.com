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
        [$access, $refresh, $expires, $merchantId, $merchantName] = getToken(client: $client);
        error_log("inside loadToken, returned from the DB: $access");
    } catch (Exception $e) {
        error_log("An error occurred in loadToken while running getToken.");
        error_log("Message: " . $e->getMessage() . " | Trace:\n" . $e->getLine());
        throw $e;
    }
    try {
        [$cipher, $iv, $a_tag, $r_tag] = getDecrypt(client: $client);
    } catch (Exception $e) {
        error_log("An error occurred in loadToken while running getDecrypt.");
        error_log("Message: " . $e->getMessage() . " | Trace:\n" . $e->getLine());
        throw $e;
    }
    if (empty($access) || empty($cipher)) {
        error_log("The cipher or access token were not present. Kicking off initial auth flow...");
        require 'kicker.php';
        exit();
    }
    error_log("Access and cipher are present: access: $access | cipher: $cipher");
    $key = hash('sha256', Bucket::getDice(), true);
    // decrypt tokens
    try {
        $decAccess = openssl_decrypt($access, $cipher, $key, OPENSSL_RAW_DATA, $iv, $a_tag);
        $decRefresh = openssl_decrypt($refresh, $cipher, $key, OPENSSL_RAW_DATA, $iv, $r_tag);
        error_log("decrypted token is: $decAccess");
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
    [$cipher, $iv, $a_tag, $r_tag] = getDecrypt(client: $merchantName);
    if (!isset($cipher)) {
        $cipher = "aes-256-gcm";
        $ivlen = openssl_cipher_iv_length($cipher);
        $iv = openssl_random_pseudo_bytes($ivlen);
    }
    $key = hash('sha256', Bucket::getDice(), true);
    $encAccess = openssl_encrypt($access, $cipher, $key, OPENSSL_RAW_DATA, $iv, $a_tag);
    $encRefresh = openssl_encrypt($refresh, $cipher, $key, OPENSSL_RAW_DATA, $iv, $r_tag);
    // Check if inputs are empty or wrong type
    if (!empty($encAccess) && !empty($encRefresh)) {
        $decRes = updateDecrypt(owner: $merchantName, cipher: $cipher, iv: $iv, a_tag: $a_tag, r_tag: $r_tag);
        $tknRes = updateToken(access: $encAccess, refresh: $encRefresh, expires: $expires, merchantId: $merchantId, merchantName: $merchantName);
        if (!empty($tknRes)) {
            error_log("An error occurred while updating the token in the database.");
            exit(1);
        }
        if (empty($decRes)) {
            error_log("An error occurred while updating the decryption in the database.");
            exit(1);
        }
        return true;
    }
}

function checkToken(string $token)
{
    $ogToken = loadToken('yegamersguild');
    try {
        $e_tag = $_SESSION['e_tag'];
        $iv = $_SESSION['iv'];
    } catch (Exception $e) {
        error_log('An error occurred while getting the decrip info for the public token, check your session.');
        error_log($_SESSION);
    }
    $cipher = "aes-256-gcm";
    $key = hash('sha256', Bucket::getDice(), true);
    $newToken = openssl_decrypt($token, $cipher, $key, OPENSSL_RAW_DATA, $iv, $e_tag);

    return $ogToken === $newToken;
}