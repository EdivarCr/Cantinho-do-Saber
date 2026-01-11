import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (import.meta.env.DEV) {
      console.log(`🔵 ${config.method?.toUpperCase()} ${config.url}`, config.data);
    }
    return config;
  }
);

// Response interceptor
api.interceptors.response.use(
  (res) => {
    if (import.meta.env.DEV) {
      console.log(`✅ Response from ${res.config.url}`, res.data);
    }
    return res;
  },
  (err) => {
    const status = err.response?.status;
    const message = err.response?.data?.message || err.message || 'Erro na requisição';

    // Auto logout on 401
    if (status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject(new Error('Sessão expirada. Faça login novamente.'));
    }

    // Network error
    if (!err.response) {
      return Promise.reject(new Error('Erro de conexão. Verifique sua internet.'));
    }

    console.error(`❌ Error ${status} from ${err.config?.url}`, message);
    return Promise.reject(new Error(message));
  }
);
