import api from './api';

const analysisService = {
  getABCAnalysis: async () => {
    const response = await api.get('/ai/abc-analysis');
    return response.data;
  },

  getAuditLogs: async (page = 1) => {
    const response = await api.get(`/audit-logs?page=${page}`);
    return response.data;
  }
};

export default analysisService;
