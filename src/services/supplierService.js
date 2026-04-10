import api from './api';

const supplierService = {
  /** GET /fournisseurs  — paginated list */
  async getAll(params = {}) {
    const response = await api.get('/fournisseurs', { params });
    return response.data;
  },

  /** GET /fournisseurs/:id */
  async getById(id) {
    const response = await api.get(`/fournisseurs/${id}`);
    return response.data;
  },

  /** POST /fournisseurs */
  async create(data) {
    const response = await api.post('/fournisseurs', data);
    return response.data;
  },

  /** PUT /fournisseurs/:id */
  async update(id, data) {
    const response = await api.put(`/fournisseurs/${id}`, data);
    return response.data;
  },

  /** DELETE /fournisseurs/:id  (soft delete) */
  async remove(id) {
    const response = await api.delete(`/fournisseurs/${id}`);
    return response.data;
  },
};

export default supplierService;
