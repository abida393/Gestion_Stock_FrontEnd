import api from '../api/axios';

const categoryService = {
  /** GET /categories */
  async getAll() {
    const response = await api.get('/categories');
    return response.data;
  },

  /** GET /categories/:id  (includes products) */
  async getById(id) {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  /** POST /categories */
  async create(data) {
    const response = await api.post('/categories', data);
    return response.data;
  },

  /** PUT /categories/:id */
  async update(id, data) {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },

  /** DELETE /categories/:id */
  async remove(id) {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};

export default categoryService;
