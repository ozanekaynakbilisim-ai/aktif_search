<?php
require_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            getReferenceSite($db, $_GET['id']);
        } else {
            getReferenceSites($db);
        }
        break;
    
    case 'POST':
        createReferenceSite($db);
        break;
    
    case 'PUT':
        if (isset($_GET['id'])) {
            updateReferenceSite($db, $_GET['id']);
        }
        break;
    
    case 'DELETE':
        if (isset($_GET['id'])) {
            deleteReferenceSite($db, $_GET['id']);
        }
        break;
    
    default:
        http_response_code(405);
        echo json_encode(array("error" => "Method not allowed"));
        break;
}

function getReferenceSites($db) {
    try {
        $query = "SELECT * FROM reference_sites ORDER BY name ASC";
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        $sites = array();
        while ($row = $stmt->fetch()) {
            $sites[] = $row;
        }
        
        echo json_encode($sites);
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(array("error" => $e->getMessage()));
    }
}

function getReferenceSite($db, $id) {
    try {
        $query = "SELECT * FROM reference_sites WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        
        if ($row = $stmt->fetch()) {
            echo json_encode($row);
        } else {
            http_response_code(404);
            echo json_encode(array("error" => "Reference site not found"));
        }
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(array("error" => $e->getMessage()));
    }
}

function createReferenceSite($db) {
    try {
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (!isset($data['name']) || !isset($data['url'])) {
            http_response_code(400);
            echo json_encode(array("error" => "Missing required fields"));
            return;
        }
        
        $query = "INSERT INTO reference_sites (name, url, category, notes) 
                  VALUES (:name, :url, :category, :notes)";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':name', $data['name']);
        $stmt->bindParam(':url', $data['url']);
        $stmt->bindParam(':category', $data['category']);
        $stmt->bindParam(':notes', $data['notes']);
        
        if ($stmt->execute()) {
            $data['id'] = $db->lastInsertId();
            echo json_encode($data);
        } else {
            http_response_code(500);
            echo json_encode(array("error" => "Failed to create reference site"));
        }
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(array("error" => $e->getMessage()));
    }
}

function updateReferenceSite($db, $id) {
    try {
        $data = json_decode(file_get_contents("php://input"), true);
        
        $query = "UPDATE reference_sites SET 
                  name = :name, 
                  url = :url, 
                  category = :category, 
                  notes = :notes,
                  updated_at = CURRENT_TIMESTAMP
                  WHERE id = :id";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->bindParam(':name', $data['name']);
        $stmt->bindParam(':url', $data['url']);
        $stmt->bindParam(':category', $data['category']);
        $stmt->bindParam(':notes', $data['notes']);
        
        if ($stmt->execute()) {
            echo json_encode(array("success" => true));
        } else {
            http_response_code(500);
            echo json_encode(array("error" => "Failed to update reference site"));
        }
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(array("error" => $e->getMessage()));
    }
}

function deleteReferenceSite($db, $id) {
    try {
        $query = "DELETE FROM reference_sites WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $id);
        
        if ($stmt->execute()) {
            echo json_encode(array("success" => true));
        } else {
            http_response_code(500);
            echo json_encode(array("error" => "Failed to delete reference site"));
        }
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(array("error" => $e->getMessage()));
    }
}
?>