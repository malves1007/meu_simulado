<?php
// Headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require 'db_config.php';

$cpf = isset($_GET['cpf']) ? $_GET['cpf'] : null;

if (!$cpf) {
    http_response_code(400);
    echo json_encode(['totalRespondidas' => 0, 'taxaAcerto' => 0]);
    exit;
}

try {
    // Conta o total de respostas do usuário
    $stmt_total = $pdo->prepare("SELECT COUNT(*) as total FROM RespostasUsuario WHERE usuario_cpf = ?");
    $stmt_total->execute([$cpf]);
    $totalRespondidas = $stmt_total->fetchColumn();

    // Conta o total de respostas corretas
    $stmt_acertos = $pdo->prepare("SELECT COUNT(*) as acertos FROM RespostasUsuario WHERE usuario_cpf = ? AND acertou = 1");
    $stmt_acertos->execute([$cpf]);
    $totalAcertos = $stmt_acertos->fetchColumn();

    // Calcula a taxa de acerto, evitando divisão por zero
    $taxaAcerto = ($totalRespondidas > 0) ? round(($totalAcertos / $totalRespondidas) * 100) : 0;

    http_response_code(200);
    echo json_encode([
        'totalRespondidas' => (int)$totalRespondidas,
        'taxaAcerto' => (int)$taxaAcerto
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erro no servidor: ' . $e->getMessage()]);
}
?>
