<?php
require_once "/home2/xikihgmy/includes/bucket.php";
// require_once "CMSDB_bucket.php";
// require_once "EVNTDB_bucket.php";

///////////////////////////////////////////////////////////////////////////////
// These functions will do whatever operations need to be done between DB 
// operations like fetching and saving the tokens or whatever other data
// needs to be scrubbed and have the same set of procedures run on it.
// Basically anything that will take more than 1 function to do, that needs
// to be done repeatedly, put them here so steps aren't missed. Then you just
// need to call the operation, not all the steps. Removes some bucket deps.
///////////////////////////////////////////////////////////////////////////////

error_log("========== Loading procedures ==========");

function validateJwt(string $token): bool
{
    $token = trim($token);
    if (substr($token, 0, 7) === 'Bearer ') {
        $token = substr($token, 7);
    }

    $ch = curl_init('https://auth.sylphaxiom.com/userinfo');
    curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer $token"]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);

    return $status === 200;
}


function requireAuth(?string $token)
{
    if (!$token) {
        http_response_code(400);
        error_log("Token header was missing from the request.");
        echo json_encode([
            'status' => 'Failure',
            'message' => 'Invalid headers.',
        ]);
        exit(1);
    }
    if (!validateJwt($token)) {
        http_response_code(401);
        error_log("JWT validation failed.");
        echo json_encode([
            'status' => 'Failure',
            'message' => 'Authorization failure.',
        ]);
        exit(1);
    }
}

function reArrayFiles(&$file_post)
{

    $file_ary = [];
    $file_count = count($file_post['name']);
    $file_keys = array_keys($file_post);

    for ($i = 0; $i < $file_count; $i++) {
        foreach ($file_keys as $key) {
            $file_ary[$i][$key] = $file_post[$key][$i];
        }
    }

    return $file_ary;
}