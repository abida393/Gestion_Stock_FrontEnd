import api from '../api/axios';

const alertService = {
  /** GET /alertes */
  async getAll() {
    const response = await api.get('/alertes');
    return response.data;
  },

  /** GET /alertes/actives */
  async getActive() {
    const response = await api.get('/alertes/actives');
    return response.data;
  },

  /** PATCH /alertes/:id/resolve */
  async resolve(id) {
    const response = await api.patch(`/alertes/${id}/resolve`);
    return response.data;
  },

  /** DELETE /alertes/:id */
  async remove(id) {
    const response = await api.delete(`/alertes/${id}`);
    return response.data;
  },
};

export default alertService;
