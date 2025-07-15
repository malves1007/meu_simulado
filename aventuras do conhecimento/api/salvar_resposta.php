<?php
// Headers de permissão (CORS)
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Resposta para a requisição "pre-flight" OPTIONS do navegador
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require 'db_config.php';

$data = json_decode(file_get_contents("php://input"));

// Validação
if (!isset($data->cpf) || !isset($data->perguntaId) || !isset($data->opcaoId) || !isset($data->acertou)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Dados da resposta incompletos.']);
    exit;
}

try {
    $sql = "INSERT INTO RespostasUsuario (usuario_cpf, pergunta_id, opcao_id, acertou) VALUES (?, ?, ?, ?)";
    $stmt = $pdo->prepare($sql);
    
    // Converte o booleano 'acertou' para 1 ou 0 para o banco de dados
    if ($stmt->execute([$data->cpf, $data->perguntaId, $data->opcaoId, $data->acertou ? 1 : 0])) {
        http_response_code(201); // Created
        echo json_encode(['success' => true, 'message' => 'Resposta guardada com sucesso.']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Erro ao guardar a resposta.']);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erro no servidor: ' . $e->getMessage()]);
}
?>
