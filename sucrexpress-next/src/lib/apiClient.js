/**
 * apiClient.js — Cliente HTTP centralizado
 *
 * UN SOLO lugar donde se define la URL del backend.
 * Todos los servicios y componentes deben importar desde aquí.
 *
 * Para cambiar de backend: editar NEXT_PUBLIC_NEST_API_URL en .env
 */

import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_NEST_API_URL
  ? `${process.env.NEXT_PUBLIC_NEST_API_URL}/api`
  : 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor de REQUEST — agrega el token JWT automáticamente
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Interceptor de RESPONSE — redirige a login si el token expiró
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default apiClient;
