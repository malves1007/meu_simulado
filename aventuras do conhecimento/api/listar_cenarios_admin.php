<?php
// Headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require 'db_config.php';

try {
    // Busca todos os cenários da tabela CenariosJogo
    $stmt = $pdo->prepare("SELECT id, texto_cenario FROM CenariosJogo ORDER BY id DESC");
    $stmt->execute();
    
    $cenarios = $stmt->fetchAll();

    http_response_code(200);
    echo json_encode($cenarios);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erro no servidor: ' . $e->getMessage()]);
}
?>
