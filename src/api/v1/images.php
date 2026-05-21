<?php
// CORS allowed URLs and handling 
$allowed_origins = [
    'http://localhost:5173',
    'https://test.sylphaxiom.com',
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
require_once 'CMSDB_bucket.php';

// Required header check
$headers = getallheaders();
$fishHead = $headers["Fish"] ?? null;
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

$method = $_SERVER['REQUEST_METHOD'];

header("Content-Type: application/json");

error_log("========== Initialized content ==========");

switch ($method) {
    case 'GET':
        $content_key = $_GET['content_key'] ?? null;
        if (empty($content_key)) {
            $contentResult = getAllImages();
            http_response_code(200);
            echo json_encode([
                'status' => "Success",
                'message' => '',
                'objects' => $contentResult,
            ]);
        } else {
            $contentResult = getImages($content_key);
            http_response_code(200);
            echo json_encode([
                'status' => 'Success',
                'message' => '',
                'objects' => $contentResult,
            ]);
        }
        break;
    case 'POST':
        initSession();
        requireAuth($fishHead, $tokenHead);

        error_log("Reached POST case, adding image and metadata...");

        if (empty($_FILES['images'])) {
            http_response_code(400);
            echo json_encode([
                'status' => 'Failure',
                'message' => 'The file was missing from the request. Please attach a valid file with the request.',
            ]);
            exit(1);
        }
        $allowList = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp', 'image/x-icon'];
        $file_array = reArrayFiles($_FILES['images']);
        foreach ($file_array as $file) {
            $name = $file['name'];
            $type = $file['type'];
            $size = $file['size'];
            error_log("Filename: $name | Type: $type | Size: $size");
            if (!in_array($file['type'], $allowList)) {
                http_response_code(400);
                echo json_encode([
                    'status' => 'Failure',
                    'message' => 'File was not of an expected type. Please ensure the file is of type: jpg, png, gif, webp, svg, bmp, or ico.'
                ]);
                exit(1);
            }
            if ($file['error'] !== UPLOAD_ERR_OK) {
                http_response_code(500);
                echo json_encode([
                    'status' => 'Failure',
                    'message' => 'An error occurred while uploading the file.',
                    'errors' => $file['error']
                ]);
                exit(1);
            }
            switch ($type) {
                case "image/jpeg":
                    $ext = ".jpg";
                    break;
                case "image/png":
                    $ext = ".png";
                    break;
                case "image/gif":
                    $ext = ".gif";
                    break;
                case "image/webp":
                    $ext = ".webp";
                    break;
                case "image/bmp":
                    $ext = ".bmp";
                    break;
                case "image/svg+xml":
                    $ext = ".svg";
                    break;
                case "image/x-icon":
                    $ext = ".ico";
                    break;
                default:
                    http_response_code(400);
                    echo json_encode([
                        "status" => "Failure",
                        "message" => 'File was not of an expected type. Please ensure the file is of type: jpg, png, gif, webp, svg, bmp, or ico.'
                    ]);
                    exit(1);
            }
            $filename = uniqid('', true) . $ext;
            $destination = "/home2/xikihgmy/public_html/uploads/$filename";
            $finalPath = "/uploads/$filename";
            $moved = move_uploaded_file($file['tmp_name'], $destination);
            if (!$moved) {
                http_response_code(500);
                echo json_encode([
                    'status' => 'Failure',
                    'message' => 'There was an error removing the file from the server.'
                ]);
            }
            $content_key = $_POST["content_key"] ?? null;
            $shortName = $_POST["shortName"] ?? null;
            $src = $finalPath;
            $alt = $_POST["alt"] ?? null;
            $displayOrder = $_POST["displayOrder"] ?? null;
            $width = $_POST["width"] ?? null;
            $height = $_POST["height"] ?? null;
            $result = putImages($content_key, $shortName, $src, $alt, $displayOrder, $width, $height);
            if (!$result) {
                http_response_code(406);
                echo json_encode([
                    'status' => 'Failure',
                    'message' => "There was an error adding $name to $content_key. Please check your request. If you believe this is in error, contact the system administrator at support@sylphaxiom.com",
                ]);
                exit(1);
            }
        }
        http_response_code(200);
        echo json_encode([
            "status" => "Success",
            "message" => "Images have been successfully added to the site."
        ]);
        break;
    case 'PUT':
        $input = json_decode(file_get_contents('php://input'), true);
        initSession();
        requireAuth($fishHead, $tokenHead);

        error_log("Reached PUT case, updating metadata only...");
        $id = $input["id"] ?? null;
        $content_key = $input["content_key"] ?? null;
        $shortName = $input["shortName"] ?? null;
        $src = $input["src"] ?? null;
        $alt = $input["alt"] ?? null;
        $displayOrder = $input["displayOrder"] ?? null;
        $width = $input["width"] ?? null;
        $height = $input["height"] ?? null;
        $result = updateMetadata($id, $content_key, $shortName, $src, $alt, $displayOrder, $width, $height);
        if (!$result) {
            http_response_code(406);
            echo json_encode([
                'status' => 'Failure',
                'message' => "There was an error adding $shortName to $content_key. Please check your request. If you believe this is in error, contact the system administrator at support@sylphaxiom.com",
            ]);
            exit(1);
        }
        http_response_code(200);
        echo json_encode([
            "status" => "Success",
            "message" => "Images successfully added to the site."
        ]);
        break;
    case 'DELETE':
        $input = json_decode(file_get_contents('php://input'), true);
        initSession();
        requireAuth($fishHead, $tokenHead);

        // remove file from disk
        // delete the row from content_images
        $id = $input['id'] ?? null;
        $imageData = getImageSrc($id);
        if (!$imageData) {
            http_response_code(500);
            echo json_encode([
                'status' => 'Fail',
                'message' => 'An error occurred while obtianing the image source.'
            ]);
            exit(1);
        }
        [$id, $src] = $imageData;
        $return = unlink("/home2/xikihgmy/public_html$src");
        if (!$return) {
            http_response_code(500);
            echo json_encode([
                "status" => "Failure",
                "message" => "There was an error while removing the file."
            ]);
            exit(1);
        }
        $return = deleteImage($id);
        if (!$return) {
            http_response_code(500);
            echo json_encode([
                "status" => "Failure",
                "message" => "There was an error while removing the file."
            ]);
            exit(1);
        }
        http_response_code(200);
        echo json_encode([
            'status' => 'Success',
            'message' => "The requested image $src was removed from the site."
        ]);
        break;
    default:
        http_response_code(405);
        echo json_encode([
            'status' =>
                'Failure',
            'message' => 'The method used to request this resource was invalid, please try again.',
        ]);
}