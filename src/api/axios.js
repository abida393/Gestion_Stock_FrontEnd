import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Attach Bearer token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sanctum_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 — clear token & redirect to login (only if not already on login page)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect if this was an auth-required call, not a background widget
      const url = error.config?.url ?? '';
      const isAuthEndpoint = url.includes('/auth/me') || url.includes('/auth/login');
      // If the token is missing or it's an explicit auth check, clear and redirect
      const token = localStorage.getItem('sanctum_token');
      if (!token || isAuthEndpoint) {
        localStorage.removeItem('sanctum_token');
        localStorage.removeItem('auth_user');
        if (window.location.pathname !== '/') {
          window.location.href = '/';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
