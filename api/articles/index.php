<?php
require_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            getArticle($db, $_GET['id']);
        } elseif (isset($_GET['slug'])) {
            getArticleBySlug($db, $_GET['slug']);
        } elseif (isset($_GET['category_id'])) {
            getArticlesByCategory($db, $_GET['category_id']);
        } else {
            getArticles($db);
        }
        break;
    
    case 'POST':
        createArticle($db);
        break;
    
    case 'PUT':
        if (isset($_GET['id'])) {
            updateArticle($db, $_GET['id']);
        }
        break;
    
    case 'DELETE':
        if (isset($_GET['id'])) {
            deleteArticle($db, $_GET['id']);
        }
        break;
    
    default:
        http_response_code(405);
        echo json_encode(array("error" => "Method not allowed"));
        break;
}

function getArticles($db) {
    try {
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
        $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
        $status = isset($_GET['status']) ? $_GET['status'] : null;
        
        $query = "SELECT a.*, c.name as category_name FROM articles a 
                  LEFT JOIN categories c ON a.category_id = c.id";
        
        if ($status) {
            $query .= " WHERE a.status = :status";
        }
        
        $query .= " ORDER BY a.publish_date DESC LIMIT :limit OFFSET :offset";
        
        $stmt = $db->prepare($query);
        
        if ($status) {
            $stmt->bindParam(':status', $status);
        }
        
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        
        $articles = array();
        while ($row = $stmt->fetch()) {
            $row['disable_ads'] = (bool)$row['disable_ads'];
            $articles[] = $row;
        }
        
        echo json_encode($articles);
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(array("error" => $e->getMessage()));
    }
}

function getArticle($db, $id) {
    try {
        $query = "SELECT a.*, c.name as category_name FROM articles a 
                  LEFT JOIN categories c ON a.category_id = c.id 
                  WHERE a.id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        
        if ($row = $stmt->fetch()) {
            $row['disable_ads'] = (bool)$row['disable_ads'];
            echo json_encode($row);
        } else {
            http_response_code(404);
            echo json_encode(array("error" => "Article not found"));
        }
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(array("error" => $e->getMessage()));
    }
}

function getArticleBySlug($db, $slug) {
    try {
        $query = "SELECT a.*, c.name as category_name, c.slug as category_slug FROM articles a 
                  LEFT JOIN categories c ON a.category_id = c.id 
                  WHERE a.slug = :slug";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':slug', $slug);
        $stmt->execute();
        
        if ($row = $stmt->fetch()) {
            $row['disable_ads'] = (bool)$row['disable_ads'];
            echo json_encode($row);
        } else {
            http_response_code(404);
            echo json_encode(array("error" => "Article not found"));
        }
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(array("error" => $e->getMessage()));
    }
}

function getArticlesByCategory($db, $category_id) {
    try {
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
        
        $query = "SELECT * FROM articles WHERE category_id = :category_id AND status = 'published' 
                  ORDER BY publish_date DESC LIMIT :limit";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':category_id', $category_id);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        
        $articles = array();
        while ($row = $stmt->fetch()) {
            $row['disable_ads'] = (bool)$row['disable_ads'];
            $articles[] = $row;
        }
        
        echo json_encode($articles);
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(array("error" => $e->getMessage()));
    }
}

function createArticle($db) {
    try {
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (!isset($data['title']) || !isset($data['slug']) || !isset($data['content'])) {
            http_response_code(400);
            echo json_encode(array("error" => "Missing required fields"));
            return;
        }
        
        $query = "INSERT INTO articles (title, slug, excerpt, hero_image, content, author, 
                  status, category_id, word_count, disable_ads, cse_keyword) 
                  VALUES (:title, :slug, :excerpt, :hero_image, :content, :author, 
                  :status, :category_id, :word_count, :disable_ads, :cse_keyword)";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':title', $data['title']);
        $stmt->bindParam(':slug', $data['slug']);
        $stmt->bindParam(':excerpt', $data['excerpt']);
        $stmt->bindParam(':hero_image', $data['hero_image']);
        $stmt->bindParam(':content', $data['content']);
        $stmt->bindParam(':author', $data['author']);
        $stmt->bindParam(':status', $data['status']);
        $stmt->bindParam(':category_id', $data['category_id']);
        $stmt->bindParam(':word_count', $data['word_count']);
        $stmt->bindParam(':disable_ads', $data['disable_ads'], PDO::PARAM_BOOL);
        $stmt->bindParam(':cse_keyword', $data['cse_keyword']);
        
        if ($stmt->execute()) {
            $data['id'] = $db->lastInsertId();
            echo json_encode($data);
        } else {
            http_response_code(500);
            echo json_encode(array("error" => "Failed to create article"));
        }
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(array("error" => $e->getMessage()));
    }
}

function updateArticle($db, $id) {
    try {
        $data = json_decode(file_get_contents("php://input"), true);
        
        $query = "UPDATE articles SET 
                  title = :title, 
                  slug = :slug, 
                  excerpt = :excerpt, 
                  hero_image = :hero_image, 
                  content = :content, 
                  author = :author, 
                  status = :status, 
                  category_id = :category_id, 
                  word_count = :word_count, 
                  disable_ads = :disable_ads, 
                  cse_keyword = :cse_keyword,
                  updated_at = CURRENT_TIMESTAMP
                  WHERE id = :id";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->bindParam(':title', $data['title']);
        $stmt->bindParam(':slug', $data['slug']);
        $stmt->bindParam(':excerpt', $data['excerpt']);
        $stmt->bindParam(':hero_image', $data['hero_image']);
        $stmt->bindParam(':content', $data['content']);
        $stmt->bindParam(':author', $data['author']);
        $stmt->bindParam(':status', $data['status']);
        $stmt->bindParam(':category_id', $data['category_id']);
        $stmt->bindParam(':word_count', $data['word_count']);
        $stmt->bindParam(':disable_ads', $data['disable_ads'], PDO::PARAM_BOOL);
        $stmt->bindParam(':cse_keyword', $data['cse_keyword']);
        
        if ($stmt->execute()) {
            echo json_encode(array("success" => true));
        } else {
            http_response_code(500);
            echo json_encode(array("error" => "Failed to update article"));
        }
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(array("error" => $e->getMessage()));
    }
}

function deleteArticle($db, $id) {
    try {
        $query = "DELETE FROM articles WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $id);
        
        if ($stmt->execute()) {
            echo json_encode(array("success" => true));
        } else {
            http_response_code(500);
            echo json_encode(array("error" => "Failed to delete article"));
        }
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(array("error" => $e->getMessage()));
    }
}
?>