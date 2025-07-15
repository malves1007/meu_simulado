// O ideal é que esta URL venha de uma variável de ambiente (.env)
const API_BASE_URL = 'http://localhost/meu_simulado/api';

// Função auxiliar para tratar a resposta
const handleResponse = async (response) => {
  // Se a resposta não for OK (status 200-299), vamos investigar
  if (!response.ok) {
    // NOVO: Lógica de depuração avançada
    // Pega a resposta do servidor como texto puro para podermos ver exatamente o que ele enviou
    const errorText = await response.text();
    
    // Mostra o erro no console do navegador (F12 -> Console)
    console.error("--- ERRO NA API ---");
    console.error("Status do Erro:", response.status, response.statusText);
    console.error("Resposta do Servidor (PHP):", errorText);
    
    // Tenta interpretar a resposta como JSON, se não conseguir, lança o erro genérico
    try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.message || 'Ocorreu um erro desconhecido na API.');
    } catch (e) {
        throw new Error('Erro de comunicação com o servidor. Verifique o console para mais detalhes.');
    }
  }
  
  // Se a resposta for OK, continua como antes
  const responseText = await response.text();
  try {
      return JSON.parse(responseText);
  } catch (e) {
      return { success: true, data: responseText };
  }
};

const apiClient = {
  // Para requisições GET
  get: async (endpoint) => {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`);
    return handleResponse(response);
  },

  // Para requisições POST com FormData
  postWithFormData: async (endpoint, formData) => {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(response);
  },
  
  // Para requisições POST com JSON (o mais comum)
  post: async (endpoint, data) => {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    return handleResponse(response);
  }
};

export default apiClient;
