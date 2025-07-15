<?php
// NOVO: Garante que o PHP lida com tudo como UTF-8
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

// Validação dos dados recebidos
if (
    !isset($data->id) ||
    !isset($data->enunciado) ||
    !isset($data->opcoes) || !is_array($data->opcoes)
) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Dados incompletos para atualização.']);
    exit;
}

// Inicia uma transação para garantir a integridade dos dados
$pdo->beginTransaction();

try {
    // 1. Atualiza a pergunta principal na tabela 'Perguntas'
    $sql_update = "UPDATE Perguntas SET enunciado = ?, nivel = ?, dificuldade = ?, explicacao = ? WHERE id = ?";
    $stmt_update = $pdo->prepare($sql_update);
    $stmt_update->execute([
        $data->enunciado,
        $data->nivel,
        $data->dificuldade,
        $data->explicacao,
        $data->id
    ]);

    // 2. Apaga as opções antigas associadas a esta pergunta
    $sql_delete_opcoes = "DELETE FROM Opcoes WHERE pergunta_id = ?";
    $stmt_delete = $pdo->prepare($sql_delete_opcoes);
    $stmt_delete->execute([$data->id]);

    // 3. Insere as novas opções atualizadas
    $sql_insert_opcao = "INSERT INTO Opcoes (pergunta_id, texto_opcao, correta) VALUES (?, ?, ?)";
    $stmt_insert = $pdo->prepare($sql_insert_opcao);

    foreach ($data->opcoes as $opcao) {
        $stmt_insert->execute([
            $data->id,
            $opcao->texto_opcao,
            $opcao->correta ? 1 : 0
        ]);
    }

    // Se tudo deu certo, confirma as alterações no banco
    $pdo->commit();

    http_response_code(200); // OK
    echo json_encode(['success' => true, 'message' => 'Pergunta atualizada com sucesso.']);

} catch (Exception $e) {
    // Se algo deu errado, desfaz tudo
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erro ao atualizar a pergunta: ' . $e->getMessage()]);
}
?>
