import api from './api';

/**
 * Notifications Service
 */
const notificationService = {
  /** GET /notifications */
  async getAll() {
    const response = await api.get('/notifications');
    return response.data;
  },

  /** GET /notifications/unread-count */
  async getUnreadCount() {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  /** PATCH /notifications/read-all */
  async readAll() {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  },

  /** PATCH /notifications/:id/read */
  async markAsRead(id) {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },

  /** DELETE /notifications/:id */
  async remove(id) {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },
};

export default notificationService;
