import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { ArrowLeftIcon } from '../components/icons';
import apiClient from '../api/apiClient'; // Importa o apiClient

const LoginPage = () => {
    const navigate = useNavigate();
    const [view, setView] = useState('login'); // 'login', 'register', 'forgot'
    
    // States de Login
    const [loginCpf, setLoginCpf] = useState('');
    const [loginSenha, setLoginSenha] = useState('');
    const [loginError, setLoginError] = useState('');
    const [loginLoading, setLoginLoading] = useState(false);

    // States de Registo
    const [registerNome, setRegisterNome] = useState('');
    const [registerCpf, setRegisterCpf] = useState('');
    const [registerEmail, setRegisterEmail] = useState('');
    const [registerSenha, setRegisterSenha] = useState('');
    const [registerError, setRegisterError] = useState('');
    const [registerLoading, setRegisterLoading] = useState(false);
    const [registerAsAdmin, setRegisterAsAdmin] = useState(false);

    // States de Redefinição de Senha
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotMessage, setForgotMessage] = useState({ text: '', success: false });
    const [forgotLoading, setForgotLoading] = useState(false);

    const { login, register } = useAuth();

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setLoginError('');
        setLoginLoading(true);
        try {
            await login(loginCpf, loginSenha);
        } catch (error) {
            setLoginError(error.message);
        } finally {
            setLoginLoading(false);
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setRegisterError('');
        setRegisterLoading(true);
        try {
            await register({
                nome: registerNome,
                cpf: registerCpf,
                email: registerEmail,
                senha: registerSenha,
                tipo_conta: registerAsAdmin ? 'Administrador' : 'Aluno',
            });
        } catch (error) {
            setRegisterError(error.message);
        } finally {
            setRegisterLoading(false);
        }
    };

    const handleForgotSubmit = async (e) => {
        e.preventDefault();
        setForgotLoading(true);
        setForgotMessage({ text: '', success: false });
        try {
            const result = await apiClient.post('solicitar_redefinicao.php', { email: forgotEmail });
            setForgotMessage({ text: result.message, success: result.success });
            // Para depuração, mostramos o token no console
            if (result.token_para_teste) {
                console.log("TOKEN DE TESTE (copie e cole na URL: /redefinir-senha/TOKEN):", result.token_para_teste);
            }
        } catch (error) {
            setForgotMessage({ text: error.message, success: false });
        } finally {
            setForgotLoading(false);
        }
    };
    
    const renderContent = () => {
        switch (view) {
            case 'register':
                return (
                    <form onSubmit={handleRegisterSubmit} className="space-y-4">
                        <div><label>Nome Completo</label><input type="text" required value={registerNome} onChange={(e) => setRegisterNome(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-gray-700 rounded-md"/></div>
                        <div><label>CPF</label><input type="text" required value={registerCpf} onChange={(e) => setRegisterCpf(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-gray-700 rounded-md"/></div>
                        <div><label>Email</label><input type="email" required value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-gray-700 rounded-md"/></div>
                        <div><label>Senha</label><input type="password" required value={registerSenha} onChange={(e) => setRegisterSenha(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-gray-700 rounded-md"/></div>
                        <div className="flex items-center"><input id="admin-register" type="checkbox" checked={registerAsAdmin} onChange={(e) => setRegisterAsAdmin(e.target.checked)} className="h-4 w-4 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500" /><label htmlFor="admin-register" className="ml-2 block text-sm text-gray-300">Registar como Administrador</label></div>
                        {registerError && <p className="text-sm text-red-400">{registerError}</p>}
                        <button type="submit" disabled={registerLoading} className="w-full py-2 px-4 bg-green-600 rounded-md disabled:opacity-50">Registar</button>
                    </form>
                );
            case 'forgot':
                return (
                    <form onSubmit={handleForgotSubmit} className="space-y-6">
                        <p className="text-center text-gray-400">Insira o seu email para receber o link de redefinição de senha.</p>
                        <div>
                            <label>Email</label>
                            <input type="email" required value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-gray-700 rounded-md"/>
                        </div>
                        {forgotMessage.text && <p className={`text-sm text-center ${forgotMessage.success ? 'text-green-400' : 'text-red-400'}`}>{forgotMessage.text}</p>}
                        <button type="submit" disabled={forgotLoading} className="w-full py-2 px-4 bg-cyan-600 rounded-md disabled:opacity-50">
                            {forgotLoading ? 'A enviar...' : 'Enviar Link'}
                        </button>
                    </form>
                );
            case 'login':
            default:
                return (
                    <form onSubmit={handleLoginSubmit} className="space-y-6">
                        <div><label>CPF</label><input type="text" required value={loginCpf} onChange={(e) => setLoginCpf(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-gray-700 rounded-md"/></div>
                        <div><label>Senha</label><input type="password" required value={loginSenha} onChange={(e) => setLoginSenha(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-gray-700 rounded-md"/></div>
                        {loginError && <p className="text-sm text-red-400">{loginError}</p>}
                        <button type="submit" disabled={loginLoading} className="w-full py-2 px-4 bg-cyan-600 rounded-md disabled:opacity-50">Entrar</button>
                    </form>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 font-['Inter',_sans-serif]">
            <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md relative">
                <button onClick={() => navigate('/')} className="absolute top-4 left-4 text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                    <ArrowLeftIcon className="w-5 h-5" />
                    <span>Voltar</span>
                </button>
                <div className="pt-8">
                    <h1 className="text-3xl font-bold text-center text-cyan-400 mb-2">
                        {view === 'login' && 'Login - Aventuras do Conhecimento'}
                        {view === 'register' && 'Registo'}
                        {view === 'forgot' && 'Recuperar Senha'}
                    </h1>
                    {renderContent()}
                    <div className="mt-6 text-center text-sm space-x-4">
                        {view !== 'login' && <button onClick={() => setView('login')} className="text-cyan-400 hover:underline">Ir para Login</button>}
                        {view !== 'register' && <button onClick={() => setView('register')} className="text-cyan-400 hover:underline">Não tem conta? Registe-se</button>}
                        {view === 'login' && <button onClick={() => setView('forgot')} className="text-cyan-400 hover:underline">Esqueceu a senha?</button>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
