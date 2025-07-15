import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import App from './App';
import './index.css'; // Importa o CSS do Tailwind

// Pega a div 'root' do seu index.html
const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);

// Renderiza a aplicação principal
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
