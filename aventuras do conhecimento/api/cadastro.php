<?php
// cadastro.php refatorado para usar PDO

// Headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

// 1. Inclui o arquivo de conexão PDO
require_once 'db_config.php';

// 2. Pega os dados do POST
// O React está enviando FormData, então usamos $_POST
$nome = isset($_POST['nome']) ? trim($_POST['nome']) : null;
$cpf = isset($_POST['cpf']) ? trim($_POST['cpf']) : null;
$email = isset($_POST['email']) ? trim($_POST['email']) : null;
$senha_plain = isset($_POST['senha']) ? $_POST['senha'] : null;
$tipo_conta = isset($_POST['tipo_conta']) && $_POST['tipo_conta'] === 'Administrador' ? 'Administrador' : 'Aluno';

// 3. Validações básicas
if (empty($nome) || empty($cpf) || empty($email) || empty($senha_plain)) {
    http_response_code(400); // Bad Request
    echo json_encode(["success" => false, "message" => "Todos os campos são obrigatórios."]);
    exit();
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Formato de email inválido."]);
    exit();
}

try {
    // 4. Verifica se o CPF ou Email já existem usando PDO
    $stmt_check = $pdo->prepare("SELECT cpf FROM Usuario WHERE cpf = ? OR email = ?");
    $stmt_check->execute([$cpf, $email]);
    
    // fetchColumn() é uma forma eficiente de verificar se uma linha existe
    if ($stmt_check->fetchColumn()) {
        http_response_code(409); // Conflict
        echo json_encode(["success" => false, "message" => "CPF ou Email já registado."]);
        exit();
    }

    // 5. Se não existem, cria o hash da senha
    $senha_hash = password_hash($senha_plain, PASSWORD_DEFAULT);

    // 6. Prepara e executa a inserção do novo usuário
    $stmt_insert = $pdo->prepare("INSERT INTO Usuario (cpf, nome, email, senha, tipo_conta) VALUES (?, ?, ?, ?, ?)");
    
    if ($stmt_insert->execute([$cpf, $nome, $email, $senha_hash, $tipo_conta])) {
        http_response_code(201); // Created
        echo json_encode(["success" => true, "message" => "Registo realizado com sucesso!"]);
    } else {
        // Este 'else' é raramente alcançado com PDO em modo de exceção, mas é uma boa prática.
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Erro ao registar utilizador."]);
    }

} catch (PDOException $e) {
    // Captura qualquer erro do banco de dados
    http_response_code(500); // Internal Server Error
    echo json_encode(["success" => false, "message" => "Erro no servidor: " . $e->getMessage()]);
}
?>
