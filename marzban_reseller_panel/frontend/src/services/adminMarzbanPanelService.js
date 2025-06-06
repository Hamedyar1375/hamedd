import apiClient from './api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('admin_token');
  if (!token) {
    // This case should ideally be handled by routing guards or higher-level logic
    // redirecting to login if no token is found.
    // Throwing an error here or returning empty headers depends on desired error handling strategy.
    console.warn('Admin token not found for API request.');
    return {};
  }
  return {
    'Authorization': `Bearer ${token}`,
  };
};

const getAllMarzbanPanels = async () => {
  return apiClient.get('/marzban-panels', { headers: getAuthHeaders() });
};

const createMarzbanPanel = async (data) => {
  return apiClient.post('/marzban-panels', data, { headers: getAuthHeaders() });
};

const updateMarzbanPanel = async (id, data) => {
  return apiClient.put(`/marzban-panels/${id}`, data, { headers: getAuthHeaders() });
};

const deleteMarzbanPanel = async (id) => {
  return apiClient.delete(`/marzban-panels/${id}`, { headers: getAuthHeaders() });
};

export default {
  getAllMarzbanPanels,
  createMarzbanPanel,
  updateMarzbanPanel,
  deleteMarzbanPanel,
};
