import api from './api';

/**
 * Supply Chain (Orders/Commandes) Service
 */
const orderService = {
  /** GET /commandes — supports filters ?status=&vendor= */
  async getAll(params = {}) {
    const response = await api.get('/commandes', { params });
    return response.data;
  },

  /** POST /commandes — Create order with line items */
  async create(data) {
    const response = await api.post('/commandes', data);
    return response.data;
  },

  /** GET /commandes/:id — Detailed order info */
  async getById(id) {
    const response = await api.get(`/commandes/${id}`);
    return response.data;
  },

  /** PUT /commandes/:id — Update order (if status is still 'en_attente') */
  async update(id, data) {
    const response = await api.put(`/commandes/${id}`, data);
    return response.data;
  },

  /** DELETE /commandes/:id — Cancel or delete order */
  async remove(id) {
    const response = await api.delete(`/commandes/${id}`);
    return response.data;
  },

  /** PATCH /commandes/:id/statut — Change order state */
  async updateStatus(id, status) {
    const response = await api.patch(`/commandes/${id}/statut`, { status });
    return response.data;
  },
};

export default orderService;
