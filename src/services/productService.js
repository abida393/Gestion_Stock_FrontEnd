import api from '../api/axios';

const productService = {
  /** GET /products  — supports ?search=&cat= */
  async getAll(params = {}) {
    const response = await api.get('/products', { params });
    return response.data;
  },

  /** GET /products/low-stock */
  async getLowStock() {
    const response = await api.get('/products/low-stock');
    return response.data;
  },

  /** GET /products/:id */
  async getById(id) {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  /** POST /products */
  async create(data) {
    const response = await api.post('/products', data);
    return response.data;
  },

  /** PUT /products/:id */
  async update(id, data) {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },

  /** DELETE /products/:id  (soft delete) */
  async remove(id) {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  /**
   * POST /products/:id/image
   * Accepts a FormData object with the image file.
   */
  async uploadImage(id, formData) {
    const response = await api.post(`/products/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

export default productService;
