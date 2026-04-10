import axios from 'axios';
import { toast } from 'react-hot-toast';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor: Attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: Error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { status, config } = error.response || {};

    if (status === 401) {
      // Avoid redirect loops if we're already on the login page or checking auth
      const isAuthCall = config.url.includes('/login') || config.url.includes('/me');
      if (!isAuthCall) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
      }
    } else if (status === 403) {
      toast.error("Unauthorized: Vous n'avez pas la permission d'effectuer cette action.");
    } else if (status >= 500) {
      toast.error("Erreur Serveur: Un problème est survenu sur le backend.");
    }

    return Promise.reject(error);
  }
);

export default api;
