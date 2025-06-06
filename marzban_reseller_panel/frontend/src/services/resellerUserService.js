import apiClient from './api';

// Helper function to get authorization headers for the reseller.
const getResellerAuthHeaders = () => {
  const token = localStorage.getItem('reseller_token');
  if (!token) {
    console.warn('Reseller token not found for API request.');
    return {};
  }
  return {
    'Authorization': `Bearer ${token}`,
  };
};

// Get users for the reseller (with pagination, filters)
const getResellerUsers = async (params = {}) => {
  // params: { skip, limit, username, status, marzban_panel_id }
  return apiClient.get('/reseller/users/', {
    params,
    headers: getResellerAuthHeaders(),
  });
};

// Get specific user details
const getResellerUserDetail = async (id) => {
  return apiClient.get(`/reseller/users/${id}`, { headers: getResellerAuthHeaders() });
};

// Get usage data for a user
const getResellerUserUsage = async (id) => {
  return apiClient.get(`/reseller/users/${id}/usage`, { headers: getResellerAuthHeaders() });
};

// Create a new Marzban user
const createResellerUser = async (data) => {
  // data: ResellerMarzbanUserCreateRequest
  // { username, password (optional), data_limit_gb, duration_days, marzban_panel_id, pricing_plan_id (optional) }
  return apiClient.post('/reseller/users/', data, { headers: getResellerAuthHeaders() });
};

// Update an existing Marzban user
const updateResellerUser = async (id, data) => {
  // data: ResellerMarzbanUserUpdateRequest
  // { data_limit_gb (optional), duration_days (optional), status (optional), pricing_plan_id (optional) }
  return apiClient.patch(`/reseller/users/${id}`, data, { headers: getResellerAuthHeaders() });
};

// Delete a Marzban user
const deleteResellerUser = async (id) => {
  return apiClient.delete(`/reseller/users/${id}`, { headers: getResellerAuthHeaders() });
};

export default {
  getResellerUsers,
  getResellerUserDetail,
  getResellerUserUsage,
  createResellerUser,
  updateResellerUser,
  deleteResellerUser,
};
