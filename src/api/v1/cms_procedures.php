<?php
require_once "/home2/xikihgmy/includes/bucket.php";
require_once "CMSDB_bucket.php";

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