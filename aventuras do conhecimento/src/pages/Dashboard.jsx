import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import apiClient from '../api/apiClient';
// NOVO: Importando os ícones necessários para os novos botões
import { CogIcon, LogoutIcon, BookOpenIcon, PlayIcon, UserIcon, TrashIcon as DeleteUserIcon } from '../components/icons';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
    const { user, logout, updateUser } = useAuth();
    const navigate = useNavigate();
    const [progress, setProgress] = useState({ totalRespondidas: 0, taxaAcerto: 0 });

    // NOVO: Estados para o modal de edição de perfil
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editNome, setEditNome] = useState(user?.nome || '');
    const [editEmail, setEditEmail] = useState(user?.email || '');
    const [editSenha, setEditSenha] = useState('');
    const [editMessage, setEditMessage] = useState({ text: '', success: false });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Define a progressão de níveis e a quantidade de XP necessária
    const NIVEIS = ['Iniciante', 'Intermediario', 'Avancado', 'Perito'];
    const XP_POR_NIVEL = 50; // Altere este valor se quiser mais/menos exercícios por nível

    // NOVO: useEffect para garantir que os campos do formulário de edição
    // sejam atualizados se os dados do utilizador mudarem.
    useEffect(() => {
        if (user) {
            setEditNome(user.nome);
            setEditEmail(user.email);
        }
    }, [user]);

    // A função de buscar progresso agora usa useCallback para poder ser chamada de vários lugares
    const fetchProgress = useCallback(async () => {
        if (!user?.cpf) return;
        try {
            // Usando a sua lógica original de busca de progresso
            const data = await apiClient.get(`buscar_progresso.php?cpf=${user.cpf}`);
            setProgress(data);
        } catch (error) {
            console.error("Erro ao buscar progresso:", error);
        }
    }, [user?.cpf]);

    // useEffect para buscar os dados quando a página carrega e quando volta a ter foco
    useEffect(() => {
        fetchProgress();
        const handleFocus = () => fetchProgress();
        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [fetchProgress]);

    // useEffect para verificar e processar a subida de nível
    useEffect(() => {
        if (!user || progress.totalRespondidas === 0) return;
        const nivelAtualIndex = NIVEIS.indexOf(user.nivel);
        const novoNivelIndexCalculado = Math.floor(progress.totalRespondidas / XP_POR_NIVEL);
        if (novoNivelIndexCalculado > nivelAtualIndex && novoNivelIndexCalculado < NIVEIS.length) {
            const novoNivel = NIVEIS[novoNivelIndexCalculado];
            const levelUp = async () => {
                try {
                    await apiClient.post('atualizar_nivel.php', { cpf: user.cpf, novoNivel: novoNivel });
                    updateUser({ nivel: novoNivel });
                    alert(`Parabéns! Você subiu para o nível ${novoNivel}!`);
                } catch (error) {
                    console.error("Falha ao atualizar o nível:", error);
                }
            };
            levelUp();
        }
    }, [progress.totalRespondidas, user, updateUser, NIVEIS]);

    // NOVO: Funções para gerir a edição e exclusão de perfil
    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setEditMessage({ text: '', success: false });
        const dataToSend = { cpf: user.cpf, nome: editNome, email: editEmail };
        if (editSenha) {
            dataToSend.senha = editSenha;
        }
        try {
            const result = await apiClient.post('update_usuario.php', dataToSend);
            setEditMessage({ text: result.message, success: result.success });
            if (result.success) {
                updateUser({ nome: editNome, email: editEmail });
                setTimeout(() => setIsEditModalOpen(false), 2000);
            }
        } catch (error) {
            setEditMessage({ text: error.message, success: false });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (window.confirm("Tem a certeza absoluta que deseja apagar a sua conta? Esta ação é irreversível.")) {
            try {
                await apiClient.post('delete_usuario.php', { cpf: user.cpf });
                alert("A sua conta foi apagada com sucesso.");
                logout();
            } catch (error) {
                alert("Ocorreu um erro ao tentar apagar a sua conta: " + error.message);
            }
        }
    };

    const progressoNivel = progress.totalRespondidas % XP_POR_NIVEL;
    const progressoData = [{ xp: progressoNivel, restante: XP_POR_NIVEL - progressoNivel }];

    return (
        <>
            <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-8">
                <div className="w-full max-w-6xl">
                    <header className="flex justify-between items-start mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-cyan-400">Painel Principal</h1>
                            <p className="text-gray-400">Bem-vindo(a), {user?.nome}! Nível: <span className="font-bold text-cyan-500">{user?.nivel}</span></p>
                        </div>
                        <div className="flex items-center gap-4">
                            {user?.tipo_conta === 'Administrador' && (
                                <button onClick={() => navigate('/admin')} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center">
                                    <CogIcon className="w-5 h-5 mr-2" /> Gerir Conteúdo
                                </button>
                            )}
                            <button onClick={logout} className="bg-red-600 hover:bg-red-700 py-2 px-4 rounded-lg flex items-center">
                                <LogoutIcon className="w-5 h-5 mr-2" /> Sair
                            </button>
                        </div>
                    </header>
                    
                    {/* NOVO: Botões de gestão de perfil */}
                    <div className="flex gap-4 mb-10">
                        <button onClick={() => setIsEditModalOpen(true)} className="text-sm text-gray-400 hover:text-white flex items-center gap-2 bg-gray-800 px-3 py-1 rounded-md">
                            <UserIcon className="w-4 h-4"/> Editar Perfil
                        </button>
                        <button onClick={handleDeleteAccount} className="text-sm text-red-500 hover:text-red-400 flex items-center gap-2 bg-gray-800 px-3 py-1 rounded-md">
                            <DeleteUserIcon className="w-4 h-4"/> Apagar Conta
                        </button>
                    </div>

                    <main>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 text-center">
                            <div className="bg-gray-800 p-6 rounded-xl"><h3 className="text-gray-400 text-sm font-bold uppercase">Taxa de Acerto</h3><p className="text-4xl font-bold text-green-400">{progress.taxaAcerto}%</p></div>
                            <div className="bg-gray-800 p-6 rounded-xl"><h3 className="text-gray-400 text-sm font-bold uppercase">Exercícios Concluídos</h3><p className="text-4xl font-bold text-white">{progress.totalRespondidas}</p></div>
                            <div className="bg-gray-800 p-6 rounded-xl flex flex-col justify-between">
                                <h3 className="text-gray-400 text-sm font-bold uppercase mb-2">Progresso para o Próximo Nível</h3>
                                <div style={{ width: '100%', height: 80 }}>
                                    <ResponsiveContainer>
                                        <BarChart layout="vertical" data={progressoData} stackOffset="expand">
                                            <XAxis type="number" hide />
                                            <YAxis type="category" dataKey="name" hide />
                                            <Tooltip
                                                cursor={{fill: 'transparent'}}
                                                contentStyle={{ backgroundColor: '#374151', border: 'none', borderRadius: '0.5rem' }}
                                                formatter={(value, name) => [`${value} / ${XP_POR_NIVEL}`, name === 'xp' ? 'XP Atual' : 'Faltam']}
                                            />
                                            <Bar dataKey="xp" fill="#22d3ee" stackId="a" />
                                            <Bar dataKey="restante" fill="#4b5563" stackId="a" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                <p className="text-sm text-gray-400 mt-2">{progressoNivel} / {XP_POR_NIVEL} XP</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div onClick={() => navigate('/quiz')} className="bg-gray-700 p-8 rounded-xl hover:bg-cyan-900/50 hover:ring-2 hover:ring-cyan-500 transition-all cursor-pointer flex flex-col items-center text-center">
                                <BookOpenIcon className="w-16 h-16 mb-4 text-cyan-400" />
                                <h2 className="text-2xl font-bold mb-2">Atividades e Exercícios</h2>
                                <p className="text-gray-400">Resolva problemas com base no seu nível de conhecimento.</p>
                            </div>
                            <div onClick={() => navigate('/game')} className="bg-gray-700 p-8 rounded-xl hover:bg-cyan-900/50 hover:ring-2 hover:ring-cyan-500 transition-all cursor-pointer flex flex-col items-center text-center">
                                <PlayIcon className="w-16 h-16 mb-4 text-cyan-400" />
                                <h2 className="text-2xl font-bold mb-2">Jogo Educativo</h2>
                                <p className="text-gray-400">Simule cenários e tome decisões para testar as suas habilidades.</p>
                            </div>
                        </div>
                    </main>
                </div>
            </div>

            {/* NOVO: Modal de Edição de Perfil */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md m-4">
                        <h2 className="text-2xl font-bold text-cyan-400 mb-6">Editar Perfil</h2>
                        <form onSubmit={handleUpdateSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300">Nome Completo</label>
                                <input type="text" value={editNome} onChange={(e) => setEditNome(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-gray-700 rounded-md"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300">Email</label>
                                <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-gray-700 rounded-md"/>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-300">Nova Senha</label>
                                <input type="password" value={editSenha} onChange={(e) => setEditSenha(e.target.value)} placeholder="Deixe em branco para não alterar" className="mt-1 block w-full px-3 py-2 bg-gray-700 rounded-md"/>
                            </div>
                            {editMessage.text && <p className={`text-sm ${editMessage.success ? 'text-green-400' : 'text-red-400'}`}>{editMessage.text}</p>}
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="w-full py-2 px-4 bg-gray-600 rounded-md hover:bg-gray-700">Cancelar</button>
                                <button type="submit" disabled={isSubmitting} className="w-full py-2 px-4 bg-cyan-600 rounded-md disabled:opacity-50 hover:bg-cyan-700">
                                    {isSubmitting ? 'A guardar...' : 'Guardar Alterações'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Dashboard;
