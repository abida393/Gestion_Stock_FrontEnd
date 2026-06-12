import api from './api';

const dashboardService = {
  async getKPIs(params) {
    const response = await api.get('/dashboard', { params });
    return response.data;
  },
};

export default dashboardService;
