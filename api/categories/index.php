<?php
require_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            getCategory($db, $_GET['id']);
        } elseif (isset($_GET['slug'])) {
            getCategoryBySlug($db, $_GET['slug']);
        } else {
            getCategories($db);
        }
        break;
    
    case 'POST':
        createCategory($db);
        break;
    
    case 'PUT':
        if (isset($_GET['id'])) {
            updateCategory($db, $_GET['id']);
        }
        break;
    
    case 'DELETE':
        if (isset($_GET['id'])) {
            deleteCategory($db, $_GET['id']);
        }
        break;
    
    default:
        http_response_code(405);
        echo json_encode(array("error" => "Method not allowed"));
        break;
}

function getCategories($db) {
    try {
        $query = "SELECT * FROM categories ORDER BY name ASC";
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        $categories = array();
        while ($row = $stmt->fetch()) {
            $row['popular_queries'] = json_decode($row['popular_queries'], true) ?: array();
            $row['is_high_cpc'] = (bool)$row['is_high_cpc'];
            $categories[] = $row;
        }
        
        echo json_encode($categories);
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(array("error" => $e->getMessage()));
    }
}

function getCategory($db, $id) {
    try {
        $query = "SELECT * FROM categories WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        
        if ($row = $stmt->fetch()) {
            $row['popular_queries'] = json_decode($row['popular_queries'], true) ?: array();
            $row['is_high_cpc'] = (bool)$row['is_high_cpc'];
            echo json_encode($row);
        } else {
            http_response_code(404);
            echo json_encode(array("error" => "Category not found"));
        }
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(array("error" => $e->getMessage()));
    }
}

function getCategoryBySlug($db, $slug) {
    try {
        $query = "SELECT * FROM categories WHERE slug = :slug";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':slug', $slug);
        $stmt->execute();
        
        if ($row = $stmt->fetch()) {
            $row['popular_queries'] = json_decode($row['popular_queries'], true) ?: array();
            $row['is_high_cpc'] = (bool)$row['is_high_cpc'];
            echo json_encode($row);
        } else {
            http_response_code(404);
            echo json_encode(array("error" => "Category not found"));
        }
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(array("error" => $e->getMessage()));
    }
}

function createCategory($db) {
    try {
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (!isset($data['name']) || !isset($data['slug']) || !isset($data['description'])) {
            http_response_code(400);
            echo json_encode(array("error" => "Missing required fields"));
            return;
        }
        
        $query = "INSERT INTO categories (name, slug, description, hero_image, is_high_cpc, popular_queries) 
                  VALUES (:name, :slug, :description, :hero_image, :is_high_cpc, :popular_queries)";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':name', $data['name']);
        $stmt->bindParam(':slug', $data['slug']);
        $stmt->bindParam(':description', $data['description']);
        $stmt->bindParam(':hero_image', $data['hero_image']);
        $stmt->bindParam(':is_high_cpc', $data['is_high_cpc'], PDO::PARAM_BOOL);
        
        $popular_queries = json_encode($data['popular_queries'] ?? array());
        $stmt->bindParam(':popular_queries', $popular_queries);
        
        if ($stmt->execute()) {
            $data['id'] = $db->lastInsertId();
            echo json_encode($data);
        } else {
            http_response_code(500);
            echo json_encode(array("error" => "Failed to create category"));
        }
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(array("error" => $e->getMessage()));
    }
}

function updateCategory($db, $id) {
    try {
        $data = json_decode(file_get_contents("php://input"), true);
        
        $query = "UPDATE categories SET 
                  name = :name, 
                  slug = :slug, 
                  description = :description, 
                  hero_image = :hero_image, 
                  is_high_cpc = :is_high_cpc, 
                  popular_queries = :popular_queries,
                  updated_at = CURRENT_TIMESTAMP
                  WHERE id = :id";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->bindParam(':name', $data['name']);
        $stmt->bindParam(':slug', $data['slug']);
        $stmt->bindParam(':description', $data['description']);
        $stmt->bindParam(':hero_image', $data['hero_image']);
        $stmt->bindParam(':is_high_cpc', $data['is_high_cpc'], PDO::PARAM_BOOL);
        
        $popular_queries = json_encode($data['popular_queries'] ?? array());
        $stmt->bindParam(':popular_queries', $popular_queries);
        
        if ($stmt->execute()) {
            echo json_encode(array("success" => true));
        } else {
            http_response_code(500);
            echo json_encode(array("error" => "Failed to update category"));
        }
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(array("error" => $e->getMessage()));
    }
}

function deleteCategory($db, $id) {
    try {
        $query = "DELETE FROM categories WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $id);
        
        if ($stmt->execute()) {
            echo json_encode(array("success" => true));
        } else {
            http_response_code(500);
            echo json_encode(array("error" => "Failed to delete category"));
        }
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(array("error" => $e->getMessage()));
    }
}
?>