<?php
// login.php refatorado para usar PDO e com verificação de nível

// Headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'db_config.php';

$cpf = isset($_POST['cpf']) ? trim($_POST['cpf']) : null;
$senha_plain = isset($_POST['senha']) ? $_POST['senha'] : null;

if (empty($cpf) || empty($senha_plain)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "CPF e Senha são obrigatórios."]);
    exit();
}

try {
    // Busca os dados do utilizador
    $stmt = $pdo->prepare("SELECT nome, senha, nivel, teste_inicial_concluido, tipo_conta FROM Usuario WHERE cpf = ?");
    $stmt->execute([$cpf]);
    $user = $stmt->fetch();

    if ($user && password_verify($senha_plain, $user['senha'])) {
        
        // Lógica para corrigir um nível inválido ou em branco
        $niveisValidos = ['Iniciante', 'Intermediario', 'Avancado', 'Perito'];
        $nivelUsuario = $user['nivel'];

        if (empty($nivelUsuario) || !in_array($nivelUsuario, $niveisValidos)) {
            $nivelUsuario = 'Iniciante'; // Define o padrão
            
            // Atualiza o banco de dados para corrigir a inconsistência
            $stmt_update = $pdo->prepare("UPDATE Usuario SET nivel = ? WHERE cpf = ?");
            $stmt_update->execute([$nivelUsuario, $cpf]);
        }

        // Login bem-sucedido
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "message" => "Login bem-sucedido!",
            "nome" => $user['nome'],
            "cpf" => $cpf,
            "nivel" => $nivelUsuario, // Envia o nível corrigido
            "teste_inicial_concluido" => (bool)$user['teste_inicial_concluido'],
            "tipo_conta" => $user['tipo_conta']
        ]);
    } else {
        // Utilizador não encontrado ou senha incorreta
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "CPF ou Senha inválidos."]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Erro no servidor: " . $e->getMessage()]);
}
?>
