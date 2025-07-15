<?php
// Headers de permissão (CORS)
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require 'db_config.php';

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->id)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'ID do cenário não fornecido.']);
    exit;
}

try {
    // A tabela OpcoesJogo será limpa automaticamente por causa do "ON DELETE CASCADE"
    $stmt = $pdo->prepare("DELETE FROM CenariosJogo WHERE id = ?");
    
    $stmt->execute([$data->id]);

    if ($stmt->rowCount() > 0) {
        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'Cenário apagado com sucesso.']);
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Nenhum cenário encontrado com este ID.']);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erro no servidor: ' . $e->getMessage()]);
}
?>
