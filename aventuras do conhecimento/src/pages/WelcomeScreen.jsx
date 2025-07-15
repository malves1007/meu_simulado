import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const WelcomeScreen = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            // Salva o usuário no localStorage antes de ir para o dashboard
            // Essa lógica pode ser movida para dentro do context se preferir
            if(user) {
                localStorage.setItem('aventurasUser', JSON.stringify(user));
            }
            navigate('/dashboard');
        }, 3500);
        return () => clearTimeout(timer);
    }, [navigate, user]);

    // Previne erro caso o usuário chegue aqui sem dados
    if (!user) {
        return (
             <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
                <p>Redirecionando...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
            <div className="text-center animate-fade-in">
                <h1 className="text-4xl font-bold text-cyan-400 mb-4">Registo Concluído!</h1>
                <p className="text-xl text-gray-300">Parabéns pela iniciativa de começar a sua trilha de conhecimento, {user.nome}.</p>
                <p className="text-lg text-gray-400 mt-2 animate-pulse">A preparar o seu painel...</p>
            </div>
        </div>
    );
};

export default WelcomeScreen;