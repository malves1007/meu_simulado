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

if (!isset($data->id) || !isset($data->texto_cenario) || !isset($data->opcoes) || !is_array($data->opcoes)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Dados do cenário incompletos para atualização.']);
    exit;
}

$pdo->beginTransaction();
try {
    // 1. Atualiza o texto do cenário principal
    $stmt_update = $pdo->prepare("UPDATE CenariosJogo SET texto_cenario = ? WHERE id = ?");
    $stmt_update->execute([$data->texto_cenario, $data->id]);

    // 2. Apaga as opções antigas
    $stmt_delete = $pdo->prepare("DELETE FROM OpcoesJogo WHERE cenario_id = ?");
    $stmt_delete->execute([$data->id]);

    // 3. Insere as novas opções
    $stmt_insert = $pdo->prepare("INSERT INTO OpcoesJogo (cenario_id, texto_opcao, efeito_orcamento, efeito_cronograma, efeito_moral) VALUES (?, ?, ?, ?, ?)");
    foreach ($data->opcoes as $opcao) {
        $stmt_insert->execute([
            $data->id,
            $opcao->texto_opcao,
            $opcao->efeito_orcamento,
            $opcao->efeito_cronograma,
            $opcao->efeito_moral
        ]);
    }

    $pdo->commit();
    http_response_code(200);
    echo json_encode(['success' => true, 'message' => 'Cenário atualizado com sucesso!']);
} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erro ao atualizar cenário: ' . $e->getMessage()]);
}
?>
