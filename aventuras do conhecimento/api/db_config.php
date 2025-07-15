<?php
$host = 'localhost';
$dbname = 'simulados';
$user = 'root';
$pass = ''; 
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$dbname;charset=$charset";

$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    // Tenta estabelecer a conexão
    $pdo = new PDO($dsn, $user, $pass, $options);
    
    // NOVO: Comando adicional para garantir a codificação UTF-8 na conexão.
    // Esta linha é uma segurança extra para resolver problemas de caracteres especiais.
    $pdo->exec("SET NAMES 'utf8mb4'");

} catch (\PDOException $e) {
    http_response_code(500);
    die(json_encode(['success' => false, 'message' => 'Falha na conexão com o banco de dados.', 'error' => $e->getMessage()]));
}
?>
