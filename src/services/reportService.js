import api from './api';

/**
 * Reporting & AI Forecasts Service
 */
const reportService = {
  /** GET /dashboard — global KPIs */
  async getDashboardKPIs() {
    const response = await api.get('/dashboard');
    return response.data;
  },

  /** GET /rapports — generated reports list */
  async getAllReports() {
    const response = await api.get('/rapports');
    return response.data;
  },

  /** POST /rapports — save report metadata */
  async saveReport(data) {
    const response = await api.post('/rapports', data);
    return response.data;
  },

  /** GET /rapports/:id/download */
  async downloadReport(id) {
    // Note: Downloads might require specific handling for blobs
    const response = await api.get(`/rapports/${id}/download`, { responseType: 'blob' });
    return response.data;
  },

  /** DELETE /rapports/:id */
  async deleteReport(id) {
    const response = await api.delete(`/rapports/${id}`);
    return response.data;
  },

  /** GET /previsions — demand forecasts */
  async getForecasts() {
    const response = await api.get('/previsions');
    return response.data;
  },

  /** POST /previsions — run new forecast */
  async runForecast(data) {
    const response = await api.post('/previsions', data);
    return response.data;
  },

  /** DELETE /previsions/:id */
  async deleteForecast(id) {
    const response = await api.delete(`/previsions/${id}`);
    return response.data;
  },

  /** GET /historique-ventes */
  async getSalesHistory() {
    const response = await api.get('/historique-ventes');
    return response.data;
  },

  /** POST /historique-ventes */
  async recordSale(data) {
    const response = await api.post('/historique-ventes', data);
    return response.data;
  },
};

export default reportService;
