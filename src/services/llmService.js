import api from './api';

const llmService = {
  /**
   * Envoie un message au chatbot global avec historique.
   */
  sendMessage: async (message, history = []) => {
    try {
      const response = await api.post('/chat', { message, history });
      return response.data.response;
    } catch (error) {
      console.error('LLM Chat Error:', error);
      throw error;
    }
  },


  /**
   * Demande une explication détaillée pour un produit.
   */
  explainPrevision: async (produitId) => {
    try {
      const response = await api.post('/ai/explain-prevision', { produit_id: produitId });
      return response.data.explanation;
    } catch (error) {
      console.error('LLM Explain Error:', error);
      throw error;
    }
  },

  /**
   * Exécute une action suggérée par l'IA (ex: création de commande).
   */
  executeAction: async (action, params) => {
    try {
      const response = await api.post('/ai/action', { action, params });
      return response.data;
    } catch (error) {
      console.error('LLM Action Error:', error);
      throw error;
    }
  }
};

export default llmService;
