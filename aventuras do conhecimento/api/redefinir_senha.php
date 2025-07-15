<?php
// api/redefinir_senha.php
ini_set('default_charset', 'UTF-8');
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

if (!isset($data->token) || !isset($data->senha) || empty($data->senha)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Token e nova senha são obrigatórios.']);
    exit;
}

try {
    // 1. Verifica se o token é válido e não expirou
    $stmt_token = $pdo->prepare("SELECT email, data_expiracao FROM RedefinicaoSenha WHERE token = ?");
    $stmt_token->execute([$data->token]);
    $reset_request = $stmt_token->fetch();

    if (!$reset_request || new DateTime() > new DateTime($reset_request['data_expiracao'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Token inválido ou expirado.']);
        exit;
    }

    // 2. Atualiza a senha do utilizador
    $senha_hash = password_hash($data->senha, PASSWORD_DEFAULT);
    $stmt_update = $pdo->prepare("UPDATE Usuario SET senha = ? WHERE email = ?");
    $stmt_update->execute([$senha_hash, $reset_request['email']]);

    // 3. Apaga o token para que não possa ser reutilizado
    $stmt_delete = $pdo->prepare("DELETE FROM RedefinicaoSenha WHERE token = ?");
    $stmt_delete->execute([$data->token]);

    http_response_code(200);
    echo json_encode(['success' => true, 'message' => 'Senha redefinida com sucesso!']);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erro no servidor: ' . $e->getMessage()]);
}
?>