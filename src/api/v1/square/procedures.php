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

function loadToken(string $merchantName)
{
    // Get data
    [$access, $refresh, $expires, $merchantId, $merchantName] = getToken($merchantName);
    [$cipher, $iv, $tag] = getDecrypt($merchantName);
    if (empty($access) || empty($cipher)) {
        error_log("The cipher or access token were not present. Kicking off initial auth flow...");
        require 'kicker.php';
        exit(1);
    }
    $key = Bucket::getDice();
    // decrypt tokens
    $decAccess = openssl_decrypt($access, $cipher, $key, OPENSSL_RAW_DATA, $iv, $tag);
    $decRefresh = openssl_decrypt($refresh, $cipher, $key, OPENSSL_RAW_DATA, $iv, $tag);
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
    [$cipher, $iv, $tag] = getDecrypt($merchantName);
    if (!isset($cipher)) {
        $cipher = "aes-256-gcm";
        $ivlen = openssl_cipher_iv_length($cipher);
        $iv = openssl_random_pseudo_bytes($ivlen);
    }
    $key = Bucket::getDice();
    $encAccess = openssl_encrypt($access, $cipher, $key, OPENSSL_RAW_DATA, $iv, $tag);
    $encRefresh = openssl_encrypt($refresh, $cipher, $key, OPENSSL_RAW_DATA, $iv, $tag);
    if (!empty($encAccess) && !empty($encRefresh)) {
        $decRes = updateDecrypt($merchantName, $cipher, $iv, $tag);
        $tknRes = updateToken($encAccess, $encRefresh, $expires, $merchantId, $merchantName);
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