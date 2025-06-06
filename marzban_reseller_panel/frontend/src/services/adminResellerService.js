import apiClient from './api';

// Helper function to get authorization headers.
// Consider moving this to a shared utility if used by many services.
const getAuthHeaders = () => {
  const token = localStorage.getItem('admin_token');
  if (!token) {
    console.warn('Admin token not found for API request.');
    // Depending on global error handling, this might throw an error
    // or be handled by API client interceptors.
    return {};
  }
  return {
    'Authorization': `Bearer ${token}`,
  };
};

const getAllResellers = async (skip = 0, limit = 100) => {
  return apiClient.get('/resellers', {
    params: { skip, limit },
    headers: getAuthHeaders(),
  });
};

const createReseller = async (data) => {
  // Backend schema ResellerCreate: username, password, email, full_name (optional),
  // is_active (optional, defaults true), marzban_panel_id (optional)
  // Ensure data matches this.
  return apiClient.post('/resellers', data, { headers: getAuthHeaders() });
};

const updateReseller = async (id, data) => {
  // Backend schema ResellerUpdate: email (optional), full_name (optional),
  // password (optional), is_active (optional)
  // Ensure data matches this.
  return apiClient.put(`/resellers/${id}`, data, { headers: getAuthHeaders() });
};

const deleteReseller = async (id) => {
  return apiClient.delete(`/resellers/${id}`, { headers: getAuthHeaders() });
};

const getResellerPanelAccess = async (resellerId) => {
  // This should return a list of MarzbanPanel objects the reseller has access to.
  return apiClient.get(`/resellers/${resellerId}/panels`, { headers: getAuthHeaders() });
};

const updateResellerPanelAccess = async (resellerId, panelIds) => {
  // panelIds should be a list of integers: e.g., {"marzban_panel_ids": [1, 2]}
  return apiClient.put(`/resellers/${resellerId}/panels`, { marzban_panel_ids: panelIds }, { headers: getAuthHeaders() });
};

export default {
  getAllResellers,
  createReseller,
  updateReseller,
  deleteReseller,
  getResellerPanelAccess,
  updateResellerPanelAccess,
};
