import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Endpoints API
export const endpointsAPI = {
  getAll: () => api.get('/api/endpoints'),
  create: (data) => api.post('/api/endpoints', data),
  update: (id, data) => api.put(`/api/endpoints/${id}`, data),
  delete: (id) => api.delete(`/api/endpoints/${id}`),
  getRequests: (id, params = {}) => api.get(`/api/endpoints/${id}/requests`, { params }),
};

// Requests API
export const requestsAPI = {
  getAll: (params = {}) => api.get('/api/requests', { params }),
  getById: (id) => api.get(`/api/requests/${id}`),
};

// Health check
export const healthAPI = {
  check: () => api.get('/health'),
};

export default api;
