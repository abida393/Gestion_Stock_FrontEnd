import api from './api';

const movementService = {
  /** GET /mouvements */
  async getAll(params = {}) {
    const response = await api.get('/mouvements', { params });
    return response.data;
  },

  /** GET /mouvements/entrees */
  async getEntries() {
    const response = await api.get('/mouvements/entrees');
    return response.data;
  },

  /** GET /mouvements/sorties */
  async getExits() {
    const response = await api.get('/mouvements/sorties');
    return response.data;
  },

  /** GET /mouvements/:id */
  async getById(id) {
    const response = await api.get(`/mouvements/${id}`);
    return response.data;
  },

  /**
   * POST /mouvements
   * Auto-updates stock levels on the backend.
   * Expected payload: { product_id, type: 'entree'|'sortie', quantity, note?, date? }
   */
  async record(data) {
    const response = await api.post('/mouvements', data);
    return response.data;
  },
};

export default movementService;
