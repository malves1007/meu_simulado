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

if (!isset($data->texto_cenario) || !isset($data->opcoes) || !is_array($data->opcoes)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Dados do cenário incompletos.']);
    exit;
}

$pdo->beginTransaction();
try {
    // Insere o cenário principal
    $stmt_cenario = $pdo->prepare("INSERT INTO CenariosJogo (texto_cenario) VALUES (?)");
    $stmt_cenario->execute([$data->texto_cenario]);
    $cenario_id = $pdo->lastInsertId();

    // Insere as opções do cenário
    $stmt_opcao = $pdo->prepare("INSERT INTO OpcoesJogo (cenario_id, texto_opcao, efeito_orcamento, efeito_cronograma, efeito_moral) VALUES (?, ?, ?, ?, ?)");
    foreach ($data->opcoes as $opcao) {
        $stmt_opcao->execute([
            $cenario_id,
            $opcao->texto_opcao,
            $opcao->efeito_orcamento,
            $opcao->efeito_cronograma,
            $opcao->efeito_moral
        ]);
    }

    $pdo->commit();
    http_response_code(201);
    echo json_encode(['success' => true, 'message' => 'Cenário do jogo adicionado com sucesso!']);
} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erro ao inserir cenário: ' . $e->getMessage()]);
}
?>
