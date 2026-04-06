import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 422) {
      // Validation errors — let the caller handle them
      return Promise.reject(error);
    }
    if (error.response?.status === 404) {
      return Promise.reject(new Error('Recurso não encontrado.'));
    }
    if (error.response?.status >= 500) {
      return Promise.reject(new Error('Erro interno do servidor. Tente novamente.'));
    }
    return Promise.reject(error);
  }
);

export default api;
