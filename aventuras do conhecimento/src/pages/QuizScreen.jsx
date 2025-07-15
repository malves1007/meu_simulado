import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import apiClient from '../api/apiClient';

// Função para embaralhar um array (algoritmo de Fisher-Yates)
const shuffleArray = (array) => {
    let currentIndex = array.length,  randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
};

const QuizScreen = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [questions, setQuestions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [isAnswered, setIsAnswered] = useState(false);

    useEffect(() => {
        const fetchQuestions = async () => {
            setIsLoading(true);
            try {
                // Passa o CPF para o backend para filtrar perguntas já respondidas
                const data = await apiClient.get(`buscar_perguntas.php?nivel=${user.nivel}&cpf=${user.cpf}`);
                setQuestions(data);
            } catch (error) {
                console.error("Erro ao buscar perguntas:", error);
            } finally {
                setIsLoading(false);
            }
        };
        if(user?.nivel && user?.cpf) fetchQuestions();
    }, [user?.nivel, user?.cpf]);

    // Memoiza e embaralha as opções da pergunta atual
    const currentQuestion = useMemo(() => {
        if (!questions || questions.length === 0) return null;
        const question = questions[currentQuestionIndex];
        if (question && question.answerOptions) {
            // Cria uma cópia embaralhada para não alterar o estado original
            return { ...question, answerOptions: shuffleArray([...question.answerOptions]) };
        }
        return question;
    }, [questions, currentQuestionIndex]);

    const handleAnswerSelection = async (option) => {
        if (isAnswered) return;
        
        setSelectedAnswer(option);
        setIsAnswered(true);

        try {
            await apiClient.post('salvar_resposta.php', {
                cpf: user.cpf,
                perguntaId: currentQuestion.id,
                opcaoId: option.id,
                acertou: option.isCorrect
            });
        } catch (error) {
            console.error("Erro ao salvar resposta:", error);
        }
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(i => i + 1);
            setIsAnswered(false);
            setSelectedAnswer(null);
        } else {
            navigate('/dashboard');
        }
    };
    
    if (isLoading) { return <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center"><p>A carregar perguntas...</p></div>; }
    if (!currentQuestion) { return <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-center items-center p-4"><div className="bg-gray-800 p-8 rounded-xl text-center"><h2 className="text-2xl text-cyan-400 mb-4">Parabéns!</h2><p>Não há mais perguntas disponíveis para o seu nível no momento.</p><button onClick={() => navigate('/dashboard')} className="mt-6 px-6 py-2 bg-cyan-600 rounded-lg">Voltar ao Painel</button></div></div>; }
    
    return ( 
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
            <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-3xl">
                <header className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-cyan-400">Atividade de Exercícios</h1>
                    <button onClick={() => navigate('/dashboard')} className="text-sm bg-gray-700 hover:bg-gray-600 py-1 px-3 rounded-lg">Voltar ao Painel</button>
                </header>
                <h2 className="text-xl font-semibold text-gray-200 mb-4">{currentQuestion.question}</h2>
                <div className="space-y-3 mb-6">
                    {currentQuestion.answerOptions.map((option) => (
                        <button
                            key={option.id}
                            onClick={() => handleAnswerSelection(option)}
                            className={`w-full text-left p-4 rounded-lg transition-all duration-150 ${ isAnswered ? (option.isCorrect ? 'bg-green-600 ring-2 ring-green-400' : (selectedAnswer?.id === option.id ? 'bg-red-600 ring-2 ring-red-400' : 'bg-gray-600 opacity-50')) : 'bg-gray-700 hover:bg-gray-600' }`}
                            disabled={isAnswered}
                        >
                            {option.texto_opcao}
                        </button>
                    ))}
                </div>
                {isAnswered && (
                    <div>
                        <p className="p-4 bg-gray-700/50 rounded-lg mb-6 text-gray-300 border border-gray-600">
                            <span className="font-bold block text-white mb-2">Explicação:</span>
                            {currentQuestion.explanation}
                        </p>
                        <button onClick={handleNextQuestion} className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 rounded-lg font-semibold">
                            {currentQuestionIndex < questions.length - 1 ? "Próxima Pergunta" : "Finalizar e Voltar ao Painel"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default QuizScreen;
