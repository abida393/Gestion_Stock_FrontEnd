import api from '../api/axios';

const authService = {
  /**
   * POST /auth/login
   * Handles multiple Sanctum response shapes:
   *   { token, user }
   *   { access_token, user }
   *   { data: { token, user } }
   *   { data: { access_token, user } }
   */
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    const payload = response.data?.data ?? response.data ?? {};

    // Try every common token key name
    const token =
      payload.token ??
      payload.access_token ??
      payload.sanctum_token ??
      payload.Bearer ??
      null;

    if (!token) {
      throw new Error('Token non trouvé dans la réponse du serveur.');
    }

    const user = payload.user ?? payload.utilisateur ?? null;

    localStorage.setItem('sanctum_token', token);
    if (user) localStorage.setItem('auth_user', JSON.stringify(user));

    return { token, user };
  },

  /**
   * POST /auth/logout
   * Revokes the token on the server, then clears localStorage.
   */
  async logout() {
    await api.post('/auth/logout');
    localStorage.removeItem('sanctum_token');
    localStorage.removeItem('auth_user');
  },

  /**
   * GET /auth/me
   * Returns the authenticated user's profile.
   */
  async me() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  /**
   * PUT /auth/me
   * Update own profile / password.
   */
  async updateProfile(data) {
    const response = await api.put('/auth/me', data);
    return response.data;
  },

  /** Returns the locally-stored user object (no API call). */
  getUser() {
    try {
      return JSON.parse(localStorage.getItem('auth_user'));
    } catch {
      return null;
    }
  },

  /** Returns true if a token exists in localStorage. */
  isAuthenticated() {
    return !!localStorage.getItem('sanctum_token');
  },
};

export default authService;
