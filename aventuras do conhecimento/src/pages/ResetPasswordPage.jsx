import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';

const ResetPasswordPage = () => {
    const { token } = useParams(); // Pega o token da URL
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState({ text: '', success: false });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setMessage({ text: 'As senhas não coincidem.', success: false });
            return;
        }
        setIsLoading(true);
        setMessage({ text: '', success: false });
        try {
            const result = await apiClient.post('redefinir_senha.php', { token, senha: password });
            setMessage({ text: result.message, success: result.success });
            if (result.success) {
                setTimeout(() => navigate('/login'), 3000);
            }
        } catch (error) {
            setMessage({ text: error.message, success: false });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
            <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md">
                <h1 className="text-3xl font-bold text-center text-cyan-400 mb-6">Redefinir Senha</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Nova Senha</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 bg-gray-700 rounded-md"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Confirmar Nova Senha</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 bg-gray-700 rounded-md"
                        />
                    </div>
                    {message.text && (
                        <p className={`text-sm text-center ${message.success ? 'text-green-400' : 'text-red-400'}`}>
                            {message.text}
                        </p>
                    )}
                    <button type="submit" disabled={isLoading} className="w-full py-2 px-4 bg-cyan-600 rounded-md disabled:opacity-50">
                        {isLoading ? 'A redefinir...' : 'Redefinir Senha'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
