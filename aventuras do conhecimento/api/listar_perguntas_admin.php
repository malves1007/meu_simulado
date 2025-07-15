<?php
// Headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require 'db_config.php'; // Usa a conexão PDO

try {
    // Prepara e executa a consulta para buscar todas as perguntas
    $stmt = $pdo->prepare("SELECT id, enunciado, nivel, dificuldade FROM Perguntas ORDER BY id DESC");
    $stmt->execute();
    
    // Busca todos os resultados
    $perguntas = $stmt->fetchAll();

    http_response_code(200); // OK
    echo json_encode($perguntas);

} catch (PDOException $e) {
    http_response_code(500); // Internal Server Error
    echo json_encode(['success' => false, 'message' => 'Erro no servidor: ' . $e->getMessage()]);
}
?>
