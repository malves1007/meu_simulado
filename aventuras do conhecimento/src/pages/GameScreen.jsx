import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';

const GameScreen = () => {
    const navigate = useNavigate();
    // Estados do jogo
    const [week, setWeek] = useState(1);
    const [budget, setBudget] = useState(50000);
    const [schedule, setSchedule] = useState(0); 
    const [morale, setMorale] = useState(80); 
    const [gameOver, setGameOver] = useState(false);
    
    // Estados de controlo da UI
    const [event, setEvent] = useState(null);
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState('loading'); // 'loading', 'playing', 'between_weeks', 'finished'

    const pickRandomEvent = useCallback(async () => {
        if (gameOver) return;
        setStatus('loading');
        try {
            const data = await apiClient.get('buscar_cenario_jogo.php');
            
            // CORREÇÃO: Verificação mais robusta. Garante que o cenário tem texto e pelo menos uma opção.
            if (data && data.text && data.options && data.options.length > 0) {
                setEvent(data);
                setStatus('playing'); // Cenário carregado, pronto para jogar
            } else {
                // Se a API não retornar um evento válido ou um evento sem opções
                if (data) {
                    console.warn("Cenário recebido da API, mas sem opções válidas:", data);
                }
                setMessage('Não foram encontrados novos eventos. Adicione cenários com opções no painel de administração.');
                setStatus('between_weeks');
            }
        } catch (error) {
            console.error("Erro ao buscar cenário:", error);
            setMessage('Não foi possível carregar um evento. Verifique a consola (F12) e o painel de administração.');
            setStatus('between_weeks'); // Permite ao jogador avançar a semana mesmo com erro
        }
    }, [gameOver]);
    
    useEffect(() => {
        pickRandomEvent();
    }, [week, pickRandomEvent]);

    const handleChoice = (option) => {
        setBudget(b => b + option.efeito_orcamento);
        setSchedule(s => Math.min(100, s + option.efeito_cronograma + 10)); 
        setMorale(m => Math.max(0, Math.min(100, m + option.efeito_moral)));
        setMessage(`Orçamento: ${option.efeito_orcamento >= 0 ? '+' : ''}${option.efeito_orcamento}. Progresso: +${option.efeito_cronograma + 10}%. Moral: ${option.efeito_moral >= 0 ? '+' : ''}${option.efeito_moral}%.`);
        setEvent(null);
        setStatus('between_weeks'); // Fim do turno, pronto para avançar
    };

    useEffect(() => {
        if (budget <= 0) {
            setMessage(`FALHA: O orçamento acabou na semana ${week}! O projeto foi cancelado.`);
            setGameOver(true);
            setStatus('finished');
        } else if (schedule >= 100) {
            setMessage(`SUCESSO! Projeto concluído na semana ${week} com um orçamento final de ${budget.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}!`);
            setGameOver(true);
            setStatus('finished');
        }
    }, [budget, schedule, week]);
    
    const renderGameContent = () => {
        switch (status) {
            case 'loading':
                return <p className="text-center animate-pulse">A carregar evento...</p>;
            case 'playing':
                return (
                    <>
                        <p className="text-lg mb-6 text-center">{event.text}</p>
                        <div className="space-y-3">
                            {event.options.map((opt, index) => (
                                <button key={index} onClick={() => handleChoice(opt)} className="w-full p-3 bg-cyan-600 hover:bg-cyan-500 rounded-lg">
                                    {opt.texto_opcao}
                                </button>
                            ))}
                        </div>
                    </>
                );
            case 'between_weeks':
            case 'finished':
                return <p className={`text-lg text-center font-semibold ${gameOver ? 'text-yellow-400' : 'text-gray-300'}`}>{message}</p>;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
            <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-3xl">
                <header className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
                    <h1 className="text-2xl font-bold text-cyan-400">Jogo: Gerente de Projetos busque concluir com o menor tempo possivel e maior eficiencia.</h1>
                    <button onClick={() => navigate('/dashboard')} className="text-sm bg-cyan-800 hover:bg-cyan-700 py-1 px-3 rounded-lg">Voltar ao Painel</button>
                </header>

                <div className="grid grid-cols-4 gap-4 text-center mb-6">
                    <div><span className="block text-gray-400 text-sm">Semana</span><span className="text-xl font-bold">{week}</span></div>
                    <div><span className="block text-gray-400 text-sm">Orçamento</span><span className={`text-xl font-bold ${budget < 10000 ? 'text-red-500' : 'text-green-400'}`}>{budget.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div>
                    <div><span className="block text-gray-400 text-sm">Progresso</span><span className="text-xl font-bold">{schedule}%</span></div>
                    <div><span className="block text-gray-400 text-sm">Moral da Equipa</span><span className={`text-xl font-bold ${morale < 50 ? 'text-red-500' : 'text-green-400'}`}>{morale}%</span></div>
                </div>

                <div className="bg-gray-700 p-6 rounded-lg min-h-[250px] flex flex-col justify-center">
                    {renderGameContent()}
                </div>
                
                <div className="text-center mt-6">
                    {status === 'between_weeks' && (
                        <button onClick={() => setWeek(w => w + 1)} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold">Avançar para a Próxima Semana</button>
                    )}
                    {status === 'finished' && (
                        <button onClick={() => navigate('/dashboard')} className="px-8 py-3 bg-cyan-600 hover:bg-cyan-700 rounded-lg font-semibold">Voltar para o Painel</button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GameScreen;
