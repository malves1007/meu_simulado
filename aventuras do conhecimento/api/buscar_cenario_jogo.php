<?php
// Headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require 'db_config.php';

try {
    // Busca um cenário aleatório que tenha pelo menos uma opção associada
    $stmt_cenario = $pdo->prepare(
        "SELECT c.id, c.texto_cenario 
         FROM CenariosJogo c
         JOIN OpcoesJogo o ON c.id = o.cenario_id
         GROUP BY c.id
         ORDER BY RAND() 
         LIMIT 1"
    );
    $stmt_cenario->execute();
    $cenario = $stmt_cenario->fetch();

    if (!$cenario) {
        http_response_code(404);
        // Retorna um JSON nulo se não houver cenários com opções
        echo json_encode(null); 
        exit;
    }

    // Busca as opções para o cenário encontrado
    $stmt_opcoes = $pdo->prepare("SELECT texto_opcao, efeito_orcamento, efeito_cronograma, efeito_moral FROM OpcoesJogo WHERE cenario_id = ?");
    $stmt_opcoes->execute([$cenario['id']]);
    $opcoes = $stmt_opcoes->fetchAll();

    // Monta a resposta final
    $resposta = [
        'text' => $cenario['texto_cenario'],
        'options' => $opcoes
    ];

    http_response_code(200);
    echo json_encode($resposta);

} catch (PDOException $e) {
    http_response_code(500);
    // Garante que a resposta de erro também seja um JSON válido
    echo json_encode(['success' => false, 'message' => 'Erro no servidor: ' . $e->getMessage()]);
}
?>
