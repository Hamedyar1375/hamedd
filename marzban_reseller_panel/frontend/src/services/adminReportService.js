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

const getSalesReport = async (period) => {
  // period could be 'daily', 'weekly', 'monthly', 'yearly', 'last7days', 'last30days'
  // The backend API will need to support these query parameters.
  return apiClient.get('/reports/sales', {
    params: { period },
    headers: getAuthHeaders(),
  });
};

const getUsageByResellerReport = async (period) => {
  return apiClient.get('/reports/usage-by-reseller', {
    params: { period },
    headers: getAuthHeaders(),
  });
};

// Example for another report type
// const getPanelUsageReport = async (panelId, period) => {
//   return apiClient.get(`/reports/panel-usage/${panelId}`, {
//     params: { period },
//     headers: getAuthHeaders(),
//   });
// };

export default {
  getSalesReport,
  getUsageByResellerReport,
  // getPanelUsageReport,
};
