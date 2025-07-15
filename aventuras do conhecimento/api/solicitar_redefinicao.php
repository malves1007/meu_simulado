<?php
// api/solicitar_redefinicao.php
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

if (!isset($data->email) || !filter_var($data->email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Por favor, insira um email válido.']);
    exit;
}

try {
    // Verifica se o email existe na base de dados
    $stmt_check = $pdo->prepare("SELECT cpf FROM Usuario WHERE email = ?");
    $stmt_check->execute([$data->email]);
    if (!$stmt_check->fetch()) {
        // Mesmo que o email não exista, damos uma resposta genérica por segurança
        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'Se um utilizador com este email existir, um link de redefinição foi enviado.']);
        exit;
    }

    // Gera um token seguro e único
    $token = bin2hex(random_bytes(50));
    // Define a data de expiração (ex: 1 hora a partir de agora)
    $data_expiracao = date('Y-m-d H:i:s', time() + 3600);

    // Insere o token na nova tabela
    $stmt_insert = $pdo->prepare("INSERT INTO RedefinicaoSenha (email, token, data_expiracao) VALUES (?, ?, ?)");
    $stmt_insert->execute([$data->email, $token, $data_expiracao]);
    
    // --- SIMULAÇÃO DO ENVIO DE EMAIL ---
    // Em produção, aqui você usaria uma biblioteca como PHPMailer para enviar o email.
    // $link = "http://localhost:5173/redefinir-senha/" . $token;
    // mail($data->email, "Redefinição de Senha", "Clique aqui para redefinir sua senha: " . $link);
    // ------------------------------------

    http_response_code(200);
    // Para depuração, devolvemos o token na resposta
    echo json_encode([
        'success' => true, 
        'message' => 'Se um utilizador com este email existir, um link de redefinição foi enviado.',
        'token_para_teste' => $token // Apenas para fins de desenvolvimento
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erro no servidor: ' . $e->getMessage()]);
}
?>
