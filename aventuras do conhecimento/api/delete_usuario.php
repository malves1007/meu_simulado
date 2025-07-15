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

if (!isset($data->cpf)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'CPF não fornecido.']);
    exit;
}

try {
    // Apaga o utilizador da tabela Usuario.
    // As respostas e outros dados ligados por chave estrangeira com "ON DELETE CASCADE" serão apagados automaticamente.
    $stmt = $pdo->prepare("DELETE FROM Usuario WHERE cpf = ?");
    
    if ($stmt->execute([$data->cpf])) {
        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'Conta apagada com sucesso.']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Erro ao apagar a conta.']);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erro no servidor: ' . $e->getMessage()]);
}
?>
