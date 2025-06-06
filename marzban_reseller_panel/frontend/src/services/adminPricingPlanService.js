import apiClient from './api';

// Helper function to get authorization headers.
// (This is duplicated from other admin services; consider moving to a shared util if refactoring)
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

const getAllPricingPlans = async () => {
  return apiClient.get('/pricing-plans', { headers: getAuthHeaders() });
};

const createPricingPlan = async (data) => {
  // Backend schema PricingPlanCreate: name, data_limit_gb, duration_days, price
  // Ensure data matches this.
  return apiClient.post('/pricing-plans', data, { headers: getAuthHeaders() });
};

const updatePricingPlan = async (id, data) => {
  // Backend schema PricingPlanUpdate: name (optional), data_limit_gb (optional),
  // duration_days (optional), price (optional)
  // Ensure data matches this.
  return apiClient.put(`/pricing-plans/${id}`, data, { headers: getAuthHeaders() });
};

const deletePricingPlan = async (id) => {
  return apiClient.delete(`/pricing-plans/${id}`, { headers: getAuthHeaders() });
};

export default {
  getAllPricingPlans,
  createPricingPlan,
  updatePricingPlan,
  deletePricingPlan,
};
