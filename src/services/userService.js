import api from './api';

/**
 * User Management Service
 */
const userService = {
  /** GET /users */
  async getAll(params = {}) {
    const response = await api.get('/users', { params });
    return response.data;
  },

  /** GET /users/:id */
  async getById(id) {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  /** POST /users */
  async create(data) {
    const response = await api.post('/users', data);
    return response.data;
  },

  /** PUT /users/:id */
  async update(id, data) {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  /** DELETE /users/:id */
  async remove(id) {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  /** POST /users/:id/roles  — Assign role to user */
  async assignRole(userId, roleName) {
    const response = await api.post(`/users/${userId}/roles`, { role: roleName });
    return response.data;
  },

  /** DELETE /users/:id/roles/:roleName — Remove role from user */
  async removeRole(userId, roleName) {
    const response = await api.delete(`/users/${userId}/roles/${roleName}`);
    return response.data;
  },
};

export default userService;
