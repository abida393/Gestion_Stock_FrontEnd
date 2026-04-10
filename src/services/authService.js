import api from './api';

/**
 * Authentication Service
 * Manages login, registration, logout, and session persistence.
 */
const authService = {
  /**
   * Logs in a user and stores their token and user data.
   */
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    
    // Support multiple response structures (wrapped in data or direct)
    const payload = response.data?.data ?? response.data ?? {};
    const token = payload.token ?? payload.access_token;
    const user = payload.user;

    if (token) {
      localStorage.setItem('token', token);
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }
    }

    return response.data;
  },

  /**
   * Registers a new user.
   */
  async register(data) {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  /**
   * Logs out the user by revoking the token and clearing storage.
   */
  async logout() {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // For legacy compatibility if any other code uses old keys
      localStorage.removeItem('sanctum_token');
      localStorage.removeItem('auth_user');
    }
  },

  /**
   * Fetches the current authenticated user's profile.
   * Useful for restoring session on refresh.
   */
  async me() {
    const response = await api.get('/auth/me');
    const user = response.data?.data ?? response.data;
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
    return user;
  },

  /** Helper: Get current user object */
  getUser() {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  },

  /** Helper: Get current Bearer token */
  getToken() {
    return localStorage.getItem('token');
  },

  /** Helper: Check if authenticated */
  isAuthenticated() {
    return !!this.getToken();
  }
};

export default authService;
