<?php
// Headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Inclui o arquivo de conexão com o banco de dados.
require 'db_config.php';

// Verifica se o ID foi passado via GET.
if (!isset($_GET['id']) || empty($_GET['id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'ID da pergunta não fornecido.']);
    exit;
}

$id = intval($_GET['id']);

try {
    // Busca a pergunta na tabela 'Perguntas'.
    $stmt = $pdo->prepare("SELECT id, enunciado, nivel, dificuldade, explicacao FROM Perguntas WHERE id = ?");
    $stmt->execute([$id]);
    $pergunta = $stmt->fetch();

    if (!$pergunta) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Pergunta não encontrada.']);
        exit;
    }

    // Busca as opções associadas na tabela 'Opcoes'.
    $stmt_opcoes = $pdo->prepare("SELECT id, texto_opcao, correta FROM Opcoes WHERE pergunta_id = ?");
    $stmt_opcoes->execute([$id]);
    $opcoes = $stmt_opcoes->fetchAll();
    
    // Converte o valor de 'correta' para booleano (true/false) para o JavaScript.
    foreach ($opcoes as &$opcao) {
        $opcao['correta'] = (bool)$opcao['correta'];
    }

    // Adiciona o array de opções ao objeto da pergunta.
    $pergunta['opcoes'] = $opcoes;

    http_response_code(200);
    echo json_encode(['success' => true, 'question' => $pergunta]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erro no servidor: ' . $e->getMessage()]);
}
?>
