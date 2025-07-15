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

// Validação dos dados recebidos
if (!isset($data->cpf) || !isset($data->novoNivel)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Dados incompletos para atualizar o nível.']);
    exit;
}

try {
    // Prepara e executa a atualização na tabela Usuario
    $stmt = $pdo->prepare("UPDATE Usuario SET nivel = ? WHERE cpf = ?");
    
    if ($stmt->execute([$data->novoNivel, $data->cpf])) {
        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'Nível atualizado com sucesso.']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Erro ao atualizar o nível.']);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erro no servidor: ' . $e->getMessage()]);
}
?>
