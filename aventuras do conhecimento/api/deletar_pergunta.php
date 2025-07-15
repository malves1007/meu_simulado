<?php
// Headers de permissão (CORS) - O "Passe Livre" para apagar
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS"); // Permite os métodos POST e OPTIONS
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Resposta para a requisição "pre-flight" OPTIONS do navegador
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require 'db_config.php';

// Pega os dados JSON enviados pelo React
$data = json_decode(file_get_contents("php://input"));

// Validação
if (!isset($data->id)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'ID da pergunta não fornecido.']);
    exit;
}

try {
    // Prepara e executa a deleção
    // A tabela Opcoes será limpa automaticamente por causa do "ON DELETE CASCADE" que definimos no SQL
    $stmt = $pdo->prepare("DELETE FROM Perguntas WHERE id = ?");
    
    $stmt->execute([$data->id]);

    // rowCount() verifica se alguma linha foi realmente afetada
    if ($stmt->rowCount() > 0) {
        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'Pergunta apagada com sucesso.']);
    } else {
        http_response_code(404); // Not Found
        echo json_encode(['success' => false, 'message' => 'Nenhuma pergunta encontrada com este ID.']);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erro no servidor: ' . $e->getMessage()]);
}
?>
