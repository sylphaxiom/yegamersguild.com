<?php
error_reporting(-1);
ini_set('display_errors', 'On');
set_error_handler("var_dump");
require_once "/home2/xikihgmy/includes/bucket.php";


function errorNotify(string $application, string $file, string $error, string $message, string $function)
{
    // connect to the DB
    $conn = Bucket::dbConn("web", "sylphaxiom");

    $headers = [
        "From" => "Error Handler <no-reply@sylphaxiom.com>",
        "Reply-To" => "no-reply@sylphaxiom.com",
        "X-Mailer" => "PHP/" . phpversion(),
        "Content-type" => "text/plain",
        "MINE-Version" => "1.0",
    ];
    $to = 'support@sylphaxiom.com';
    $subject = 'An error has occurred from the APIs';
    $msg = "An error was encountered in an API call or function...\n\n$message\n\nPlease review the logs and debug. Contact the client if necessary.";
}