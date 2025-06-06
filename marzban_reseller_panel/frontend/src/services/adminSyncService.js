import apiClient from './api';

// Helper function to get authorization headers.
const getAuthHeaders = () => {
  const token = localStorage.getItem('admin_token');
  if (!token) {
    console.warn('Admin token not found for API request.');
    return {};
  }
  return {
    'Authorization': `Bearer ${token}`,
  };
};

// Get current sync status
const getSyncStatus = async () => {
  // Assuming the backend route is /api/v1/admin/sync/status/
  return apiClient.get('/admin/sync/status/', { headers: getAuthHeaders() });
};

// Start a user synchronization task for a specific Marzban panel
const startUserSync = async (panelId) => {
  // Assuming the backend route is /api/v1/admin/sync/users/?panel_id={panel_id}
  return apiClient.post(`/admin/sync/users/?panel_id=${panelId}`, {}, { headers: getAuthHeaders() });
  // Sending an empty object {} as POST body if no specific payload is needed for triggering.
};

// Start a comprehensive sync for a panel
const startFullSync = async (panelId) => {
  // Assuming the backend route is /api/v1/admin/sync/all/?panel_id={panel_id}
  return apiClient.post(`/admin/sync/all/?panel_id=${panelId}`, {}, { headers: getAuthHeaders() });
};

// Optional: if backend provides sync history via a separate endpoint
// const getSyncHistory = async () => {
//   return apiClient.get('/admin/sync/history/', { headers: getAuthHeaders() });
// };

export default {
  getSyncStatus,
  startUserSync,
  startFullSync,
  // getSyncHistory,
};
