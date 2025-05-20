import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos de timeout
});

// Interceptor para añadir el token automáticamente
api.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

// Interceptor para manejar errores globalmente
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Si el token es inválido, limpiamos el almacenamiento
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
    }
    return Promise.reject(error);
  }
);

// Función de login mejorada
export const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login/', credentials);
    
    localStorage.setItem('authToken', response.data.token);
    localStorage.setItem('userData', JSON.stringify(response.data.user));
    
    // Configura el token para futuras peticiones
    api.defaults.headers.common['Authorization'] = `Token ${response.data.token}`;
    
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error; // Permite manejar el error en el componente
  }
};

// Función para logout
export const logout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
  delete api.defaults.headers.common['Authorization'];
};

export default api;