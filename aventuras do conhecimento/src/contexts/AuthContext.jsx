import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('aventurasUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (cpf, senha) => {
    const formData = new FormData();
    formData.append('cpf', cpf);
    formData.append('senha', senha);
    
    const result = await apiClient.postWithFormData('login.php', formData);

    if (result.success) {
      localStorage.setItem('aventurasUser', JSON.stringify(result));
      setUser(result);
      navigate('/dashboard');
    } else {
      throw new Error(result.message || 'CPF ou senha inválidos.');
    }
  };

  const register = async (userData) => {
     const formData = new FormData();
     formData.append('nome', userData.nome);
     formData.append('cpf', userData.cpf);
     formData.append('email', userData.email);
     formData.append('senha', userData.senha);
     formData.append('tipo_conta', userData.tipo_conta);
     const result = await apiClient.postWithFormData('cadastro.php', formData);
     if (result.success) {
        const newUser = { ...result, ...userData, nivel: 'Iniciante' };
        setUser(newUser);
        navigate('/welcome');
     } else {
        throw new Error(result.message || 'Erro ao realizar o registo.');
     }
  };

  const logout = useCallback(() => {
    localStorage.removeItem('aventurasUser');
    setUser(null);
    // [CORREÇÃO] Agora, ao fazer logout, o utilizador é redirecionado para a Landing Page.
    navigate('/', { replace: true }); 
  }, [navigate]);

  const updateUser = (newUserData) => {
    const updatedUser = { ...user, ...newUserData };
    setUser(updatedUser);
    localStorage.setItem('aventurasUser', JSON.stringify(updatedUser));
  };

  const value = { user, loading, login, logout, register, updateUser };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
