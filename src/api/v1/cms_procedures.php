<?php
require_once "/home2/xikihgmy/includes/bucket.php";
require_once "CMSDB_bucket.php";
require_once "vendor/autoload.php";

///////////////////////////////////////////////////////////////////////////////
// These functions will do whatever operations need to be done between DB 
// operations like fetching and saving the tokens or whatever other data
// needs to be scrubbed and have the same set of procedures run on it.
// Basically anything that will take more than 1 function to do, that needs
// to be done repeatedly, put them here so steps aren't missed. Then you just
// need to call the operation, not all the steps. Removes some bucket deps.
///////////////////////////////////////////////////////////////////////////////

error_log("========== Loading procedures ==========");

function initSession()
{
    // GET state and start session
    $state = $_GET['state'] ?? null;
    if (!$state) {
        http_response_code(418);
        error_log("State was missing from GET. Enclude state to ensure session continuity...");
        exit(1);
    }
    session_id($state);
    session_start();
    if ($_SESSION['state'] != $state) {
        http_response_code(401);
        error_log("Auth state does not match current state! Check your code or you're a hacker (jerk)...");
        exit(1);
    }
}

function validateJwt(string $fish, string $token): bool
{
    [$clientId, $clientSecret] = Bucket::getA0Client($fish);
    if (!$clientId || !$clientSecret) {
        http_response_code(500);
        error_log("An issue occurred attempting to grab the A0 info from the bucket...");
        exit(1);
    }
    $domain = "auth.sylphaxiom.com";
    $audience = "https://api.sylphaxiom.com";
    // Now instantiate the Auth0 class with our configuration:
    $auth0 = new \Auth0\SDK\Auth0([
        'strategy' => \Auth0\SDK\Configuration\SdkConfiguration::STRATEGY_API,
        'domain' => $domain,
        'clientId' => $clientId,
        'clientSecret' => $clientSecret,
        'audience' => $audience,
    ]);
    // Process passed token
    $token = trim($token);
    if (substr($token, 0, 7) === 'Bearer ') {
        $token = substr($token, 7);
    }

    // Attempt to decode the token:
    try {
        $token = $auth0->decode($token, null, null, null, null, null, null, \Auth0\SDK\Token::TYPE_TOKEN);
    } catch (\Auth0\SDK\Exception\InvalidTokenException $exception) {
        // The token wasn't valid. Return false and leave
        return false;
    }
    return true;
}

function requireAuth(string $fish, ?string $token)
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
    if (!validateJwt($fish, $token)) {
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