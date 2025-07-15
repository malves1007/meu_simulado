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
if (!isset($data->cpf) || !isset($data->nome) || !isset($data->email)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Dados incompletos.']);
    exit;
}

try {
    // Verifica se o novo email já está a ser usado por outro utilizador
    $stmt_check = $pdo->prepare("SELECT cpf FROM Usuario WHERE email = ? AND cpf != ?");
    $stmt_check->execute([$data->email, $data->cpf]);
    if ($stmt_check->fetch()) {
        http_response_code(409); // Conflict
        echo json_encode(['success' => false, 'message' => 'Este email já está a ser usado por outra conta.']);
        exit;
    }

    // Constrói a query de atualização dinamicamente
    $sql = "UPDATE Usuario SET nome = ?, email = ?";
    $params = [$data->nome, $data->email];

    // Se uma nova senha foi fornecida, adiciona-a à query
    if (isset($data->senha) && !empty($data->senha)) {
        $senha_hash = password_hash($data->senha, PASSWORD_DEFAULT);
        $sql .= ", senha = ?";
        $params[] = $senha_hash;
    }

    $sql .= " WHERE cpf = ?";
    $params[] = $data->cpf;

    $stmt = $pdo->prepare($sql);
    
    if ($stmt->execute($params)) {
        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'Perfil atualizado com sucesso!']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Erro ao atualizar o perfil.']);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erro no servidor: ' . $e->getMessage()]);
}
?>
