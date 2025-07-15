import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { TrashIcon, PlusCircleIcon, PencilIcon } from '../components/icons';

const AdminPanel = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('quiz');
    
    // --- States do Quiz ---
    const [questions, setQuestions] = useState([]);
    const [isLoadingQuiz, setIsLoadingQuiz] = useState(true);
    const [editingQuizId, setEditingQuizId] = useState(null);
    const [enunciado, setEnunciado] = useState('');
    const [nivel, setNivel] = useState('Iniciante');
    const [dificuldade, setDificuldade] = useState('Fácil');
    const [explicacao, setExplicacao] = useState('');
    const [opcoes, setOpcoes] = useState(['', '', '', '']);
    const [correctOptionIndex, setCorrectOptionIndex] = useState(0);
    
    // --- States do Jogo ---
    const [gameScenarios, setGameScenarios] = useState([]);
    const [isLoadingGame, setIsLoadingGame] = useState(true);
    const [editingGameId, setEditingGameId] = useState(null);
    const [cenarioText, setCenarioText] = useState('');
    const [gameOpcoes, setGameOpcoes] = useState([
        { texto_opcao: '', efeito_orcamento: 0, efeito_cronograma: 0, efeito_moral: 0 },
        { texto_opcao: '', efeito_orcamento: 0, efeito_cronograma: 0, efeito_moral: 0 }
    ]);
    
    // --- States Gerais ---
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ text: '', success: false });

    // CORREÇÃO: A lista de níveis agora corresponde ao ENUM do seu banco de dados.
    const NIVEIS_QUIZ = ['Iniciante', 'Intermediário', 'Perito'];

    // --- Lógica de Carregamento de Dados ---
    const fetchQuestions = useCallback(async () => {
        setIsLoadingQuiz(true);
        try {
            const data = await apiClient.get('listar_perguntas_admin.php');
            setQuestions(Array.isArray(data) ? data : []);
        } catch (error) {
            setMessage({ text: error.message, success: false });
        } finally {
            setIsLoadingQuiz(false);
        }
    }, []);

    const fetchGameScenarios = useCallback(async () => {
        setIsLoadingGame(true);
        try {
            const data = await apiClient.get('listar_cenarios_admin.php');
            setGameScenarios(Array.isArray(data) ? data : []);
        } catch (error) {
            setMessage({ text: error.message, success: false });
        } finally {
            setIsLoadingGame(false);
        }
    }, []);

    useEffect(() => {
        if (activeTab === 'quiz') {
            fetchQuestions();
        } else {
            fetchGameScenarios();
        }
    }, [activeTab, fetchQuestions, fetchGameScenarios]);

    // --- Funções do Quiz ---
    const handleQuizOptionChange = (index, value) => {
        const newOpcoes = [...opcoes];
        newOpcoes[index] = value;
        setOpcoes(newOpcoes);
    };

    const handleQuizEditClick = async (id) => {
        setMessage({ text: 'A carregar dados para edição...', success: true });
        try {
            const data = await apiClient.get(`buscar_pergunta_por_id.php?id=${id}`);
            if (data && data.success) {
                const q = data.question;
                setEnunciado(q.enunciado);
                
                if (NIVEIS_QUIZ.includes(q.nivel)) {
                    setNivel(q.nivel);
                } else {
                    console.warn(`Nível "${q.nivel}" recebido da API não é uma opção válida. A usar 'Iniciante' como padrão.`);
                    setNivel('Iniciante');
                }

                setDificuldade(q.dificuldade);
                setExplicacao(q.explicacao);
                setOpcoes(q.opcoes.map(o => o.texto_opcao));
                setCorrectOptionIndex(q.opcoes.findIndex(o => o.correta));
                setEditingQuizId(q.id);
                setMessage({ text: '', success: false });
            } else {
                throw new Error(data.message || 'Pergunta não encontrada.');
            }
        } catch (error) {
            setMessage({ text: error.message, success: false });
        }
    };

    const resetQuizForm = () => {
        setEditingQuizId(null);
        setEnunciado('');
        setNivel('Iniciante');
        setDificuldade('Fácil');
        setExplicacao('');
        setOpcoes(['', '', '', '']);
        setCorrectOptionIndex(0);
        setMessage({ text: '', success: false });
    };

    const handleQuizSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage({ text: '', success: false });
        const dataToSend = { id: editingQuizId, enunciado, nivel, dificuldade, explicacao, opcoes: opcoes.map((texto, index) => ({ texto_opcao: texto, correta: index === correctOptionIndex })) };
        const endpoint = editingQuizId ? 'update_pergunta.php' : 'inserir_pergunta.php';
        try {
            const result = await apiClient.post(endpoint, dataToSend);
            setMessage({ text: result.message, success: result.success });
            if (result.success) {
                if (editingQuizId) {
                    resetQuizForm();
                } else {
                    setEnunciado('');
                    setExplicacao('');
                    setOpcoes(['', '', '', '']);
                    setCorrectOptionIndex(0);
                }
                fetchQuestions();
            }
        } catch (error) {
            setMessage({ text: error.message, success: false });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteQuestion = async (id) => {
        if (!window.confirm('Tem a certeza que deseja apagar esta pergunta?')) return;
        try {
            await apiClient.post('deletar_pergunta.php', { id });
            fetchQuestions();
        } catch (error) {
            alert('Falha ao apagar a pergunta: ' + error.message);
        }
    };

    // --- Funções do Jogo ---
    const handleGameOptionChange = (index, field, value) => {
        const newGameOpcoes = [...gameOpcoes];
        newGameOpcoes[index][field] = value;
        setGameOpcoes(newGameOpcoes);
    };
    
    const addGameOption = () => {
        setGameOpcoes([...gameOpcoes, { texto_opcao: '', efeito_orcamento: 0, efeito_cronograma: 0, efeito_moral: 0 }]);
    };

    const removeGameOption = (indexToRemove) => {
        if (gameOpcoes.length > 2) {
            setGameOpcoes(gameOpcoes.filter((_, index) => index !== indexToRemove));
        }
    };

    const resetGameForm = () => {
        setEditingGameId(null);
        setCenarioText('');
        setGameOpcoes([{ texto_opcao: '', efeito_orcamento: 0, efeito_cronograma: 0, efeito_moral: 0 }, { texto_opcao: '', efeito_orcamento: 0, efeito_cronograma: 0, efeito_moral: 0 }]);
        setMessage({ text: '', success: false });
    };

    const handleGameEditClick = async (id) => {
        setMessage({ text: 'A carregar dados para edição...', success: true });
        try {
            const data = await apiClient.get(`buscar_cenario_por_id.php?id=${id}`);
            if (data && data.success) {
                const s = data.scenario;
                setCenarioText(s.texto_cenario);
                setGameOpcoes(s.opcoes);
                setEditingGameId(s.id);
                setMessage({ text: '', success: false });
            } else {
                throw new Error(data.message || 'Cenário não encontrado.');
            }
        } catch (error) {
            setMessage({ text: error.message, success: false });
        }
    };

    const handleGameFormSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage({ text: '', success: false });
        const dataToSend = { id: editingGameId, texto_cenario: cenarioText, opcoes: gameOpcoes };
        const endpoint = editingGameId ? 'update_cenario_jogo.php' : 'inserir_cenario_jogo.php';
        try {
            const result = await apiClient.post(endpoint, dataToSend);
            setMessage({ text: result.message, success: result.success });
            if (result.success) {
                resetGameForm();
                fetchGameScenarios();
            }
        } catch (error) {
            setMessage({ text: error.message, success: false });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleDeleteScenario = async (id) => {
        if (!window.confirm('Tem a certeza que deseja apagar este cenário?')) return;
        try {
            await apiClient.post('deletar_cenario_jogo.php', { id });
            fetchGameScenarios();
        } catch (error) {
            alert('Falha ao apagar o cenário: ' + error.message);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-indigo-400">Painel de Administração</h1>
                <button onClick={() => navigate('/dashboard')} className="bg-cyan-600 hover:bg-cyan-700 py-2 px-4 rounded-lg">Voltar ao Painel</button>
            </header>

            <div className="flex border-b border-gray-700 mb-8">
                <button onClick={() => setActiveTab('quiz')} className={`py-2 px-4 ${activeTab === 'quiz' ? 'border-b-2 border-indigo-400 text-indigo-400' : 'text-gray-400'}`}>Gerir Perguntas do Quiz</button>
                <button onClick={() => setActiveTab('game')} className={`py-2 px-4 ${activeTab === 'game' ? 'border-b-2 border-indigo-400 text-indigo-400' : 'text-gray-400'}`}>Gerir Cenários do Jogo</button>
            </div>

            {activeTab === 'quiz' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Formulário para Adicionar/Editar Pergunta do Quiz */}
                    <div className="bg-gray-800 p-6 rounded-lg">
                        <h2 className="text-2xl font-bold text-indigo-300 mb-4 flex items-center">
                            {editingQuizId ? <PencilIcon className="w-6 h-6 mr-2" /> : <PlusCircleIcon className="w-6 h-6 mr-2" />}
                            {editingQuizId ? 'Editar Pergunta' : 'Adicionar Nova Pergunta'}
                        </h2>
                        <form onSubmit={handleQuizSubmit} className="space-y-4">
                            <div><label className="block text-sm font-medium text-gray-300">Enunciado</label><textarea required value={enunciado} onChange={(e) => setEnunciado(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-gray-700 rounded-md"/></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300">Nível</label>
                                    <select value={nivel} onChange={(e) => setNivel(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-gray-700 rounded-md">
                                        {NIVEIS_QUIZ.map(n => <option key={n} value={n}>{n}</option>)}
                                    </select>
                                </div>
                                <div><label className="block text-sm font-medium text-gray-300">Dificuldade</label><select value={dificuldade} onChange={(e) => setDificuldade(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-gray-700 rounded-md"><option>Fácil</option><option>Médio</option><option>Difícil</option></select></div>
                            </div>
                            <div><label className="block text-sm font-medium text-gray-300">Explicação (feedback para o aluno)</label><textarea required value={explicacao} onChange={(e) => setExplicacao(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-gray-700 rounded-md"/></div>
                            <div><label className="block text-sm font-medium text-gray-300">Opções de Resposta (selecione a correta)</label>
                                <div className="space-y-2 mt-1">
                                    {opcoes.map((opt, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <input type="radio" name="correctOption" id={`opt-${index}`} checked={correctOptionIndex === index} onChange={() => setCorrectOptionIndex(index)} className="form-radio h-5 w-5 text-green-500 bg-gray-700 border-gray-600 focus:ring-green-500"/>
                                            <input type="text" placeholder={`Opção ${index + 1}`} required value={opt} onChange={(e) => handleQuizOptionChange(index, e.target.value)} className="block w-full px-3 py-2 bg-gray-700 rounded-md"/>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {message.text && <p className={`text-sm ${message.success ? 'text-green-400' : 'text-red-400'}`}>{message.text}</p>}
                            <div className="flex gap-4">
                                <button type="submit" disabled={isSubmitting} className="flex-1 py-2 px-4 bg-indigo-600 rounded-md disabled:opacity-50 hover:bg-indigo-700">
                                    {isSubmitting ? 'A guardar...' : (editingQuizId ? 'Salvar Alterações' : 'Adicionar Pergunta')}
                                </button>
                                {editingQuizId && (
                                    <button type="button" onClick={resetQuizForm} className="py-2 px-4 bg-gray-600 rounded-md hover:bg-gray-700">
                                        Cancelar Edição
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                    {/* Lista de Perguntas Existentes */}
                    <div className="bg-gray-800 p-6 rounded-lg">
                        <h2 className="text-2xl font-bold text-indigo-300 mb-4">Perguntas Existentes</h2>
                        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                            {isLoadingQuiz ? <p>A carregar...</p> : questions.map(q => (
                                <div key={q.id} className="bg-gray-700 p-4 rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <p className="flex-1 pr-4 mb-2">{q.enunciado}</p>
                                        <div className="flex gap-2 flex-shrink-0">
                                            <button onClick={() => handleQuizEditClick(q.id)} className="text-gray-400 hover:text-cyan-400">
                                                <PencilIcon className="w-5 h-5"/>
                                            </button>
                                            <button onClick={() => handleDeleteQuestion(q.id)} className="text-gray-400 hover:text-red-500">
                                                <TrashIcon className="w-5 h-5"/>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 text-xs text-gray-300">
                                        <span className="bg-gray-600 px-2 py-1 rounded-full font-medium">{q.nivel}</span>
                                        <span className="bg-gray-600 px-2 py-1 rounded-full font-medium">{q.dificuldade}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : ( 
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Formulário para adicionar/editar cenário do jogo */}
                    <div className="bg-gray-800 p-6 rounded-lg">
                        <h2 className="text-2xl font-bold text-indigo-300 mb-4 flex items-center">
                            {editingGameId ? <PencilIcon className="w-6 h-6 mr-2" /> : <PlusCircleIcon className="w-6 h-6 mr-2" />}
                            {editingGameId ? 'Editar Cenário do Jogo' : 'Adicionar Cenário do Jogo'}
                        </h2>
                        <form onSubmit={handleGameFormSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300">Texto do Cenário</label>
                                <textarea required value={cenarioText} onChange={(e) => setCenarioText(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-gray-700 rounded-md"/>
                            </div>
                            {gameOpcoes.map((opcao, index) => (
                                <div key={index} className="bg-gray-700 p-4 rounded-md space-y-2 border border-gray-600">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-semibold">Opção {index + 1}</h3>
                                        {gameOpcoes.length > 2 && (
                                            <button type="button" onClick={() => removeGameOption(index)} className="text-red-500 hover:text-red-400">
                                                <TrashIcon className="w-5 h-5"/>
                                            </button>
                                        )}
                                    </div>
                                    <input type="text" placeholder="Texto da opção" required value={opcao.texto_opcao} onChange={(e) => handleGameOptionChange(index, 'texto_opcao', e.target.value)} className="block w-full px-3 py-2 bg-gray-600 rounded-md"/>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-400">Orçamento</label>
                                            <input type="number" value={opcao.efeito_orcamento} onChange={(e) => handleGameOptionChange(index, 'efeito_orcamento', parseInt(e.target.value) || 0)} className="block w-full px-3 py-2 bg-gray-600 rounded-md"/>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-400">Cronograma</label>
                                            <input type="number" value={opcao.efeito_cronograma} onChange={(e) => handleGameOptionChange(index, 'efeito_cronograma', parseInt(e.target.value) || 0)} className="block w-full px-3 py-2 bg-gray-600 rounded-md"/>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-400">Moral</label>
                                            <input type="number" value={opcao.efeito_moral} onChange={(e) => handleGameOptionChange(index, 'efeito_moral', parseInt(e.target.value) || 0)} className="block w-full px-3 py-2 bg-gray-600 rounded-md"/>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button type="button" onClick={addGameOption} className="w-full py-2 text-sm text-cyan-400 hover:text-cyan-300">
                                + Adicionar Outra Opção
                            </button>
                             {message.text && <p className={`text-sm ${message.success ? 'text-green-400' : 'text-red-400'}`}>{message.text}</p>}
                            <div className="flex gap-4">
                                <button type="submit" disabled={isSubmitting} className="flex-1 py-2 px-4 bg-indigo-600 rounded-md disabled:opacity-50 hover:bg-indigo-700">
                                    {isSubmitting ? 'A guardar...' : (editingGameId ? 'Salvar Alterações' : 'Adicionar Cenário')}
                                </button>
                                {editingGameId && (
                                    <button type="button" onClick={resetGameForm} className="py-2 px-4 bg-gray-600 rounded-md hover:bg-gray-700">
                                        Cancelar Edição
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                     {/* Lista de cenários existentes */}
                    <div className="bg-gray-800 p-6 rounded-lg">
                         <h2 className="text-2xl font-bold text-indigo-300 mb-4">Cenários Existentes</h2>
                         <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                            {isLoadingGame ? <p>A carregar...</p> : gameScenarios.map(s => (
                                <div key={s.id} className="bg-gray-700 p-3 rounded flex justify-between items-center">
                                    <p className="flex-1 pr-4">{s.texto_cenario}</p>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleGameEditClick(s.id)} className="text-gray-400 hover:text-cyan-400">
                                            <PencilIcon className="w-5 h-5"/>
                                        </button>
                                        <button onClick={() => handleDeleteScenario(s.id)} className="text-gray-400 hover:text-red-500">
                                            <TrashIcon className="w-5 h-5"/>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
