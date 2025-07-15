<?php
// Headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require 'db_config.php';

// Pega o nível do utilizador da URL
$nivel = isset($_GET['nivel']) ? $_GET['nivel'] : 'Iniciante';

try {
    // CORREÇÃO: A consulta agora busca 5 perguntas aleatórias do nível especificado,
    // permitindo que o utilizador as refaça para praticar.
    $sql = "SELECT * FROM Perguntas WHERE nivel = ? ORDER BY RAND() LIMIT 5";
            
    $stmt_perguntas = $pdo->prepare($sql);
    $stmt_perguntas->execute([$nivel]);
    $perguntas = $stmt_perguntas->fetchAll();

    $quiz_completo = [];

    // Para cada pergunta, busca as suas respectivas opções
    foreach ($perguntas as $pergunta) {
        $stmt_opcoes = $pdo->prepare("SELECT id, texto_opcao, correta FROM Opcoes WHERE pergunta_id = ?");
        $stmt_opcoes->execute([$pergunta['id']]);
        $opcoes = $stmt_opcoes->fetchAll();

        // Converte 'correta' para booleano
        foreach ($opcoes as &$opcao) {
            $opcao['isCorrect'] = (bool)$opcao['correta'];
            unset($opcao['correta']);
        }

        // Monta a estrutura final esperada pelo React
        $quiz_completo[] = [
            'id' => $pergunta['id'],
            'question' => $pergunta['enunciado'],
            'explanation' => $pergunta['explicacao'],
            'answerOptions' => $opcoes
        ];
    }

    http_response_code(200);
    echo json_encode($quiz_completo);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erro no servidor: ' . $e->getMessage()]);
}
?>
