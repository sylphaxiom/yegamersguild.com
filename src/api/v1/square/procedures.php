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

function saveToken(string $access, string $refresh, string $expires, string $merchantId, string $merchantName)
{
    // Encrypt tokens
    // save to DB
    // return boolean
}

function loadToken()
{
    // pull from DB
    // Decrypt tokens
    // validate expiration/refresh as needed
    // return CLIENT USABLE token/data
}

function encryptToken(string $cipher, string $iv, string $tag, string $token)
{

    // Adapt this to fit the function. This is what is currently being used to encrypt
    $cipher = "aes-256-gcm";
    if (in_array($cipher, openssl_get_cipher_methods())) {
        error_log("Cipher present, encrypting...");
        $ivlen = openssl_cipher_iv_length($cipher);
        $iv = openssl_random_pseudo_bytes($ivlen);
        $key = Bucket::getDice();
        $cipherAccess = openssl_encrypt($token, $cipher, $key, $options = 0, $iv, $tag);
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
            }
        }
    }
}

function decryptToken()
{
    // Create this. It will decrypt the token.
}