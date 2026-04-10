import api from './api';

const dashboardService = {
  /** GET /dashboard — global KPIs */
  async getKPIs() {
    const response = await api.get('/dashboard');
    return response.data;
  },
};

export default dashboardService;
