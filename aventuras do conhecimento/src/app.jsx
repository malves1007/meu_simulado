import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuth from './hooks/useAuth';

// Importação das Páginas
import LandingPage from './pages/LandingPage.jsx'; // NOVO
import LoginPage from './pages/LoginPage.jsx';
import WelcomeScreen from './pages/WelcomeScreen.jsx';
import Dashboard from './pages/Dashboard.jsx';
import QuizScreen from './pages/QuizScreen.jsx';
import GameScreen from './pages/GameScreen.jsx';
import AdminPanel from './pages/AdminPanel.jsx';

// Componente para proteger rotas que precisam de login
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Componente para proteger rotas de Admin
const AdminRoute = ({ children }) => {
    const { user } = useAuth();
    if (!user || user.tipo_conta !== 'Administrador') {
        return <Navigate to="/dashboard" replace />;
    }
    return children;
}

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* CORREÇÃO: A rota principal agora é a Landing Page */}
      <Route path="/" element={<LandingPage />} />
      
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
      <Route path="/welcome" element={<ProtectedRoute><WelcomeScreen /></ProtectedRoute>} />
      
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/quiz" element={<ProtectedRoute><QuizScreen /></ProtectedRoute>} />
      <Route path="/game" element={<ProtectedRoute><GameScreen /></ProtectedRoute>} />
      
      <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />

      {/* Rota padrão: redireciona para a página inicial */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
