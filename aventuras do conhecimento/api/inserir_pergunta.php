<?php
// Garante que o PHP lida com tudo como UTF-8
ini_set('default_charset', 'UTF-8');

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

// Pega os dados JSON enviados pelo React
$data = json_decode(file_get_contents("php://input"));

// Validação dos dados
if (
    !isset($data->enunciado) || empty($data->enunciado) ||
    !isset($data->opcoes) || !is_array($data->opcoes)
) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Dados da pergunta incompletos.']);
    exit;
}

// Inicia uma transação para garantir a integridade dos dados
$pdo->beginTransaction();

try {
    // 1. Insere a pergunta na tabela 'Perguntas'
    $sql_pergunta = "INSERT INTO Perguntas (enunciado, nivel, dificuldade, explicacao) VALUES (?, ?, ?, ?)";
    $stmt_pergunta = $pdo->prepare($sql_pergunta);

    // CORREÇÃO FINAL: Força a conversão de cada string para UTF-8 antes de executar a query.
    // Isso resolve problemas de codificação persistentes.
    $stmt_pergunta->execute([
        mb_convert_encoding($data->enunciado, 'UTF-8', 'auto'),
        mb_convert_encoding($data->nivel, 'UTF-8', 'auto'),
        mb_convert_encoding($data->dificuldade, 'UTF-8', 'auto'),
        mb_convert_encoding($data->explicacao, 'UTF-8', 'auto')
    ]);

    // Pega o ID da pergunta que acabamos de inserir
    $pergunta_id = $pdo->lastInsertId();

    // 2. Insere as opções na tabela 'Opcoes'
    $sql_opcao = "INSERT INTO Opcoes (pergunta_id, texto_opcao, correta) VALUES (?, ?, ?)";
    $stmt_opcao = $pdo->prepare($sql_opcao);

    foreach ($data->opcoes as $opcao) {
        $stmt_opcao->execute([
            $pergunta_id,
            mb_convert_encoding($opcao->texto_opcao, 'UTF-8', 'auto'),
            $opcao->correta ? 1 : 0
        ]);
    }

    // Se tudo deu certo, confirma as alterações
    $pdo->commit();

    http_response_code(201); // Created
    echo json_encode(['success' => true, 'message' => 'Pergunta adicionada com sucesso!']);

} catch (Exception $e) {
    // Se algo deu errado, desfaz tudo
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erro ao inserir pergunta: ' . $e->getMessage()]);
}
?>
