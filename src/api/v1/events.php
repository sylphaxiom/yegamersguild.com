<?php
// CORS allowed URLs and handling 
$allowed_origins = [
    'http://localhost:5173',
    'https://test.sylphaxiom.com',
    'https://yegamersguild.com',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age:3600');
    header('Access-Control-Allow-Headers:Content-type, Authorization, Fish');
    header('Access-Control-Allow-Methods:GET, PUT, POST, DELETE, OPTIONS');
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("HTTP/1.1 200 OK");
    exit;
}

// Comment out the following 2 lines for production.
error_reporting(-1);
ini_set('display_errors', 'On');


require_once "/home2/xikihgmy/includes/bucket.php";
require_once 'cms_procedures.php';
require_once 'EVNTDB_bucket.php';

// Required header check
$headers = getallheaders();
$fishHead = $headers["Fish"] ?? $_SERVER['HTTP_FISH'] ?? null;
$tokenHead = $headers["Authorization"] ?? null;
if (!isset($fishHead)) {
    http_response_code(418);
    echo "fish is not present";
    exit(1);
}
if (!Bucket::fishDance($fishHead)) {
    http_response_code(401);
    echo "fish is incorrect";
    exit(1);
}

/**
 * Validate and normalise a recurrence rule from the request body.
 * Returns a JSON string for the `events.recurrence` column, or null for a
 * one-time event. Throws InvalidArgumentException on a malformed rule.
 *
 * Shape: { freq: daily|weekly|monthly, interval: int>=1,
 *          byweekday?: int[0-6], monthly_mode?: day_of_month|nth_weekday|last_weekday,
 *          until?: "YYYY-MM-DD", exdates?: "YYYY-MM-DD"[] }
 */
function normalizeRecurrence($raw): ?string
{
    if ($raw === null || $raw === '' || $raw === false) {
        return null;
    }
    if (is_string($raw)) {
        $raw = json_decode($raw, true);
    }
    if (!is_array($raw)) {
        throw new InvalidArgumentException('recurrence must be an object');
    }
    $freq = $raw['freq'] ?? null;
    if (!in_array($freq, ['daily', 'weekly', 'monthly'], true)) {
        throw new InvalidArgumentException('recurrence.freq must be daily, weekly or monthly');
    }
    $interval = (int) ($raw['interval'] ?? 1);
    if ($interval < 1 || $interval > 99) {
        throw new InvalidArgumentException('recurrence.interval must be between 1 and 99');
    }
    $isDate = function ($d) {
        return is_string($d) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $d)
            && checkdate((int) substr($d, 5, 2), (int) substr($d, 8, 2), (int) substr($d, 0, 4));
    };
    $rule = ['freq' => $freq, 'interval' => $interval];

    if ($freq === 'weekly') {
        $days = array_values(array_unique(array_filter(
            array_map('intval', (array) ($raw['byweekday'] ?? [])),
            fn($d) => $d >= 0 && $d <= 6
        )));
        sort($days);
        if ($days) {
            $rule['byweekday'] = $days;
        }
    }
    if ($freq === 'monthly') {
        $mode = $raw['monthly_mode'] ?? 'day_of_month';
        if (!in_array($mode, ['day_of_month', 'nth_weekday', 'last_weekday'], true)) {
            throw new InvalidArgumentException('recurrence.monthly_mode is invalid');
        }
        $rule['monthly_mode'] = $mode;
    }
    if (!empty($raw['until'])) {
        if (!$isDate($raw['until'])) {
            throw new InvalidArgumentException('recurrence.until must be YYYY-MM-DD');
        }
        $rule['until'] = $raw['until'];
    }
    if (!empty($raw['exdates'])) {
        $ex = array_values(array_unique(array_filter((array) $raw['exdates'], $isDate)));
        sort($ex);
        if ($ex) {
            $rule['exdates'] = $ex;
        }
    }
    return json_encode($rule);
}

/** Read + validate the recurrence from the request, or send a 400 and exit. */
function recurrenceFromInput(array $input): ?string
{
    try {
        return normalizeRecurrence($input['recurrence'] ?? null);
    } catch (InvalidArgumentException $e) {
        error_log("Invalid recurrence: " . $e->getMessage());
        http_response_code(400);
        echo json_encode([
            'status' => 'Failure',
            'message' => 'Invalid repeat settings: ' . $e->getMessage(),
        ]);
        exit(1);
    }
}

$method = $_SERVER['REQUEST_METHOD'];

header("Content-Type: application/json");

error_log("========== Initialized events ==========");

switch ($method) {
    case 'GET':
        error_log("Getting all events...");
        $contentResult = getAllEvents();
        // `recurrence` is stored as a JSON string; hand it to the client as an object.
        if (is_array($contentResult)) {
            foreach ($contentResult as &$row) {
                if (isset($row['recurrence']) && is_string($row['recurrence'])) {
                    $row['recurrence'] = json_decode($row['recurrence'], true);
                }
            }
            unset($row);
        }
        http_response_code(200);
        echo json_encode([
            'status' => "Success",
            'message' => '',
            'objects' => $contentResult,
        ]);
        break;
    case 'POST':
        requireAuth($tokenHead);
        error_log("Authenticated and adding event content...");
        $input = json_decode(file_get_contents('php://input'), true);
        $title = $input['title'] ?? null;
        $description = $input['description'] ?? null;
        $start_datetime = $input['start_datetime'] ?? null;
        $end_datetime = $input['end_datetime'] ?? null;
        $all_day = $input['all_day'] ?? false;
        if (!$title || !$start_datetime) {
            error_log("title or start_datetime were missing. Values are: $title | $start_datetime");
            http_response_code(400);
            echo json_encode([
                'status' => 'Failure',
                'message' => 'The title or start time were missing from the request body.',
            ]);
            exit(1);
        }
        $recurrence = recurrenceFromInput($input);
        $result = putEvent($title, $description, $start_datetime, $end_datetime, $all_day, $recurrence);
        if (!$result) {
            error_log("putEvent returned false, there was an error in the DB transaction...");
            http_response_code(406);
            echo json_encode([
                'status' => 'Failure',
                'message' => "There was an error adding the $title event. Please check your request. If you believe this is in error, contact the system administrator at support@sylphaxiom.com",
            ]);
            exit(1);
        }
        http_response_code(200);
        echo json_encode([
            "status" => "Success",
            "message" => "Event: $title has been added successfully."
        ]);
        break;
    case 'PUT':
        requireAuth($tokenHead);
        error_log("Authenticated and updating event content...");
        $input = json_decode(file_get_contents('php://input'), true);
        $id = (int) ($input['id'] ?? 0);
        $title = $input['title'] ?? null;
        $description = $input['description'] ?? null;
        $start_datetime = $input['start_datetime'] ?? null;
        $end_datetime = $input['end_datetime'] ?? null;
        $all_day = $input['all_day'] ?? false;
        if (!$id || !$title || !$start_datetime) {
            error_log("id, title, or start_datetime were missing. Values are: $id | $title | $start_datetime");
            http_response_code(400);
            echo json_encode([
                'status' => 'Failure',
                'message' => 'The id, title, or start time were missing from the request body.',
            ]);
            exit(1);
        }
        $recurrence = recurrenceFromInput($input);
        $result = updateEvent($id, $title, $description, $start_datetime, $end_datetime, $all_day, $recurrence);
        if (!$result) {
            error_log("updateEvent returned false, there was an error in the DB transaction...");
            http_response_code(406);
            echo json_encode([
                'status' => 'Failure',
                'message' => "There was an error updating the $title event. Please check your request. If you believe this is in error, contact the system administrator at support@sylphaxiom.com",
            ]);
            exit(1);
        }
        http_response_code(200);
        echo json_encode([
            "status" => "Success",
            "message" => "Event: $title has been updated successfully."
        ]);
        break;
    case 'DELETE':
        requireAuth($tokenHead);
        error_log("Authenticated and deleting event content...");
        $input = json_decode(file_get_contents('php://input'), true);
        $id = (int) ($input['id'] ?? 0);
        if (!$id) {
            error_log("id is missing. Values are: $id");
            http_response_code(400);
            echo json_encode([
                'status' => 'Failure',
                'message' => 'The id was missing from the request body and is required to delete an event.',
            ]);
            exit(1);
        }
        $return = deleteEvent($id);
        if (!$return) {
            error_log("deleteEvent returned false, there was an error in the DB transaction...");
            http_response_code(500);
            echo json_encode([
                "status" => "Failure",
                "message" => "There was an error while removing the event."
            ]);
            exit(1);
        }
        http_response_code(200);
        echo json_encode([
            'status' => 'Success',
            'message' => "The event with id $id was deleted successfully."
        ]);
        break;
    default:
        error_log("Default statement reached, the method was invalid...");
        http_response_code(405);
        echo json_encode([
            'status' =>
                'Failure',
            'message' => 'The method used to request this resource was invalid, please try again.',
        ]);
}