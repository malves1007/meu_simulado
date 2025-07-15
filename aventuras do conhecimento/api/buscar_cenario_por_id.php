<?php
// Headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require 'db_config.php';

if (!isset($_GET['id']) || empty($_GET['id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'ID do cenário não fornecido.']);
    exit;
}

$id = intval($_GET['id']);

try {
    // Busca o cenário principal
    $stmt_cenario = $pdo->prepare("SELECT id, texto_cenario FROM CenariosJogo WHERE id = ?");
    $stmt_cenario->execute([$id]);
    $cenario = $stmt_cenario->fetch();

    if (!$cenario) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Cenário não encontrado.']);
        exit;
    }

    // Busca as opções associadas
    $stmt_opcoes = $pdo->prepare("SELECT id, texto_opcao, efeito_orcamento, efeito_cronograma, efeito_moral FROM OpcoesJogo WHERE cenario_id = ?");
    $stmt_opcoes->execute([$id]);
    $opcoes = $stmt_opcoes->fetchAll();

    $cenario['opcoes'] = $opcoes;

    http_response_code(200);
    echo json_encode(['success' => true, 'scenario' => $cenario]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erro no servidor: ' . $e->getMessage()]);
}
?>
