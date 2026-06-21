<?php
/**
 * B2Bfiy Institute - Client-Side to Server-Side Synchronization API
 * This PHP file acts as a lightweight, zero-config backend for your cPanel hosting.
 * It stores all your custom changes (logos, services, portfolios, metadata) in a JSON file
 * so that all other visitors from any phone/device will see the changes instantly!
 */

// Allow cross-origin requests (useful for local development testing)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, X-Admin-Auth");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json");

// Handle CORS flight paths
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$dbFile = __DIR__ . '/site_db.json';

// Polyfill getallheaders() for PHP CGI/FastCGI environments commonly found on free/shared cPanel hostings
if (!function_exists('getallheaders')) {
    function getallheaders() {
        $headers = [];
        foreach ($_SERVER as $name => $value) {
            if (substr($name, 0, 5) == 'HTTP_') {
                // Convert HTTP_X_ADMIN_AUTH to X-Admin-Auth
                $headerName = str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($name, 5)))));
                $headers[$headerName] = $value;
            }
        }
        return $headers;
    }
}

// Helper to reliably retrieve admin authentication token across various PHP/webserver configs
function getAdminAuthToken() {
    if (isset($_SERVER['HTTP_X_ADMIN_AUTH'])) {
        return $_SERVER['HTTP_X_ADMIN_AUTH'];
    }
    $headers = getallheaders();
    if (is_array($headers)) {
        $headers = array_change_key_case($headers, CASE_LOWER);
        if (isset($headers['x-admin-auth'])) {
            return $headers['x-admin-auth'];
        }
    }
    return '';
}

// Handle File uploads first
if (isset($_GET['action']) && $_GET['action'] === 'upload' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    // Audit & enforce Admin Authorization for file uploads to resist spam and unauthorized server abuse
    $adminAuth = getAdminAuthToken();
    $isAdmin = ($adminAuth === '3b76a31c1021da8fb1c5c94191159aea3c4a4fef5588b9a08315f6a3c5aa6e6a');

    if (!$isAdmin) {
        http_response_code(403);
        echo json_encode(["status" => "error", "message" => "Access denied. Admin authorization required for uploads."]);
        exit;
    }

    if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "No file uploaded or file upload error."]);
        exit;
    }

    $file = $_FILES['file'];
    $uploadDir = __DIR__ . '/uploads/';

    // Create uploads directory if not exists with correct permissions
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    // Get file info
    $filename = $file['name'];
    $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
    
    // Allowed formats (Images, Videos, Vector assets)
    $allowed = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'ico', 'mp4', 'webm', 'mov', 'avi', 'mkv', 'heic', 'heif'];
    if (!in_array($ext, $allowed)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Format not supported! (Allowed formats: images, videos)"]);
        exit;
    }

    // Generate unique name
    $newFilename = 'file_' . time() . '_' . rand(1000, 9999) . '.' . $ext;
    $targetFile = $uploadDir . $newFilename;

    // Generate dynamic absolute base URL for robust asset linking on any domain/subfolder/device
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || (isset($_SERVER['SERVER_PORT']) && $_SERVER['SERVER_PORT'] == 443)) ? "https://" : "http://";
    $host = isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : 'localhost';
    $uri = isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : '/';
    // Strip api.php and any query params from REQUEST_URI to obtain base folder path
    $baseDir = preg_replace('/api\.php.*$/i', '', $uri);
    if (substr($baseDir, -1) !== '/') {
        $baseDir .= '/';
    }
    $baseUrl = $protocol . $host . $baseDir;

    if (move_uploaded_file($file['tmp_name'], $targetFile)) {
        $publicUrl = $baseUrl . 'uploads/' . $newFilename;
        echo json_encode([
            "status" => "success",
            "message" => "File uploaded successfully!",
            "url" => $publicUrl
        ]);
    } else {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Failed to save file. Please check folder write permissions."]);
    }
    exit;
}

// Helpers for AES-256-CBC Database Encryption/Obfuscation
function encryptDatabase($plaintext, $key) {
    $cipher_method = 'aes-256-cbc';
    $iv_length = openssl_cipher_iv_length($cipher_method);
    $iv = openssl_random_pseudo_bytes($iv_length);
    $encrypted = openssl_encrypt($plaintext, $cipher_method, $key, 0, $iv);
    // Format: base64(IV::ciphertext)
    return base64_encode($iv . '::' . $encrypted);
}

function decryptDatabase($ciphertext, $key) {
    $cipher_method = 'aes-256-cbc';
    $decoded_payload = base64_decode($ciphertext);
    
    if ($decoded_payload && strpos($decoded_payload, '::') !== false) {
        list($iv, $encrypted_raw) = explode('::', $decoded_payload, 2);
        $decrypted = openssl_decrypt($encrypted_raw, $cipher_method, $key, 0, $iv);
        if ($decrypted !== false) {
            $data = json_decode($decrypted, true);
            if (is_array($data)) {
                return $data;
            }
        }
    }
    
    // Fallback: If ciphertext is not yet encrypted, decode as plain JSON
    $data = json_decode($ciphertext, true);
    if (is_array($data)) {
        return $data;
    }
    
    return [];
}

// Serve data for GET requests
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (file_exists($dbFile)) {
        $rawFileContents = file_get_contents($dbFile);
        $decryptedData = decryptDatabase($rawFileContents, 'rakib1122@#_secure_salt_b2bfiy');
        echo json_encode($decryptedData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    } else {
        // Return thin empty object if not initialized yet
        echo json_encode(new stdClass());
    }
    exit;
}

// Save data for POST requests
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $rawInput = file_get_contents('php://input');
    $decoded = json_decode($rawInput, true);
    
    if (!$decoded) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Invalid JSON payload"]);
        exit;
    }
    
    // Normalize headers for cross-platform compatibility
    $adminAuth = getAdminAuthToken();
    $isAdmin = ($adminAuth === '3b76a31c1021da8fb1c5c94191159aea3c4a4fef5588b9a08315f6a3c5aa6e6a');

    // Load existing server data
    $existingData = [];
    if (file_exists($dbFile)) {
        $rawFileContents = file_get_contents($dbFile);
        $existingData = decryptDatabase($rawFileContents, 'rakib1122@#_secure_salt_b2bfiy');
    }

    if ($isAdmin) {
        // Admin gets absolute permission to rewrite/set any synced keys
        $finalData = $decoded;
    } else {
        // Public visitor - ONLY allowed to append to contact_submissions
        if (isset($decoded['contact_submissions'])) {
            $newSubmissions = json_decode($decoded['contact_submissions'], true);
            if (!is_array($newSubmissions)) {
                $newSubmissions = [];
            }
            
            // Get current submissions on server
            $currentSubmissions = isset($existingData['contact_submissions']) ? json_decode($existingData['contact_submissions'], true) : [];
            if (!is_array($currentSubmissions)) {
                $currentSubmissions = [];
            }
            
            // Merge submissions safely filtering duplicate IDs
            $merged = $currentSubmissions;
            $existingIds = array_map(function($item) { return isset($item['id']) ? $item['id'] : ''; }, $merged);
            
            foreach ($newSubmissions as $sub) {
                if (isset($sub['id']) && !in_array($sub['id'], $existingIds)) {
                    $merged[] = $sub;
                }
            }
            
            // Keep existing app configurations untouched, only update submissions
            $finalData = $existingData;
            $finalData['contact_submissions'] = json_encode($merged, JSON_UNESCAPED_UNICODE);
        } else {
            // Unauthenticated POST trying to write admin data without token
            http_response_code(403);
            echo json_encode(["status" => "error", "message" => "Access denied. Admin authorization required for site modifications."]);
            exit;
        }
    }
    
    // Save updated database as encrypted AES JSON
    $jsonString = json_encode($finalData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    if ($jsonString) {
        $encryptedPayload = encryptDatabase($jsonString, 'rakib1122@#_secure_salt_b2bfiy');
        file_put_contents($dbFile, $encryptedPayload);
        echo json_encode(["status" => "success", "message" => "Database successfully synchronized across all devices!"]);
    } else {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Failed to serialize JSON database"]);
    }
    exit;
}
