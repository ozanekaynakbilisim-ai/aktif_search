<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

class Database {
    private $host;
    private $db_name;
    private $username;
    private $password;
    private $conn;

    public function __construct() {
        // cPanel MySQL ayarları - bu değerleri kendi veritabanı bilgilerinizle değiştirin
        $this->host = 'localhost'; // Genellikle localhost
        $this->db_name = 'your_database_name'; // cPanel'de oluşturduğunuz veritabanı adı
        $this->username = 'your_db_username'; // cPanel veritabanı kullanıcı adı
        $this->password = 'your_db_password'; // cPanel veritabanı şifresi
    }

    public function getConnection() {
        $this->conn = null;
        
        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8",
                $this->username,
                $this->password,
                array(
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8"
                )
            );
        } catch(PDOException $exception) {
            error_log("Connection error: " . $exception->getMessage());
            http_response_code(500);
            echo json_encode(array("error" => "Database connection failed"));
            exit();
        }
        
        return $this->conn;
    }
}
?>