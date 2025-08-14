<?php
require_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        getSettings($db);
        break;
    
    case 'POST':
    case 'PUT':
        updateSettings($db);
        break;
    
    default:
        http_response_code(405);
        echo json_encode(array("error" => "Method not allowed"));
        break;
}

function getSettings($db) {
    try {
        $query = "SELECT setting_key, setting_value FROM admin_settings";
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        $settings = array();
        while ($row = $stmt->fetch()) {
            $value = $row['setting_value'];
            
            // JSON decode if it's a JSON string
            $decoded = json_decode($value, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $value = $decoded;
            }
            
            $settings[$row['setting_key']] = $value;
        }
        
        echo json_encode($settings);
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(array("error" => $e->getMessage()));
    }
}

function updateSettings($db) {
    try {
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (!$data) {
            http_response_code(400);
            echo json_encode(array("error" => "Invalid JSON data"));
            return;
        }
        
        $db->beginTransaction();
        
        foreach ($data as $key => $value) {
            // Convert arrays/objects to JSON
            if (is_array($value) || is_object($value)) {
                $value = json_encode($value);
            }
            
            $query = "INSERT INTO admin_settings (setting_key, setting_value) 
                      VALUES (:key, :value) 
                      ON DUPLICATE KEY UPDATE 
                      setting_value = :value, updated_at = CURRENT_TIMESTAMP";
            
            $stmt = $db->prepare($query);
            $stmt->bindParam(':key', $key);
            $stmt->bindParam(':value', $value);
            $stmt->execute();
        }
        
        $db->commit();
        echo json_encode(array("success" => true));
        
    } catch(Exception $e) {
        $db->rollback();
        http_response_code(500);
        echo json_encode(array("error" => $e->getMessage()));
    }
}
?>