import api from './api';

/**
 * RBAC (Roles & Permissions) Service
 */
const roleService = {
  /** GET /roles */
  async getAllRoles() {
    const response = await api.get('/roles');
    return response.data;
  },

  /** POST /roles */
  async createRole(data) {
    const response = await api.post('/roles', data);
    return response.data;
  },

  /** GET /roles/:id */
  async getRoleById(id) {
    const response = await api.get(`/roles/${id}`);
    return response.data;
  },

  /** PUT /roles/:id */
  async updateRole(id, data) {
    const response = await api.put(`/roles/${id}`, data);
    return response.data;
  },

  /** DELETE /roles/:id */
  async deleteRole(id) {
    const response = await api.delete(`/roles/${id}`);
    return response.data;
  },

  /** POST /roles/:id/permissions — Sync permissions for a role */
  async syncPermissions(roleId, permissions) {
    const response = await api.post(`/roles/${roleId}/permissions`, { permissions });
    return response.data;
  },

  /** GET /permissions */
  async getAllPermissions() {
    const response = await api.get('/permissions');
    return response.data;
  },
};

export default roleService;
