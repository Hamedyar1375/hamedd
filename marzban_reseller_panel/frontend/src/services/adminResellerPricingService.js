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

// Get all pricing overrides for a specific reseller
const getPricingsForReseller = async (resellerId) => {
  return apiClient.get(`/reseller-pricings/${resellerId}`, { headers: getAuthHeaders() });
};

// Create or Update a specific pricing override for a reseller and a plan.
// The backend POST /reseller-pricings/ is expected to handle upsert logic
// based on unique combination of reseller_id and pricing_plan_id, or create new.
const setResellerPricing = async (data) => {
  // data should include reseller_id, pricing_plan_id, custom_price
  return apiClient.post('/reseller-pricings/', data, { headers: getAuthHeaders() });
};

// Remove a specific pricing override by its own ID
const deleteResellerPricing = async (overrideId) => {
  return apiClient.delete(`/reseller-pricings/${overrideId}`, { headers: getAuthHeaders() });
};

// Example for batch update if backend were to support it
// const batchUpdateResellerPricings = async (resellerId, pricingsArray) => {
//   // pricingsArray would be like [{ pricing_plan_id: 1, custom_price: 9.99 }, ...]
//   return apiClient.post(`/reseller-pricings/${resellerId}/batch`, { pricings: pricingsArray }, { headers: getAuthHeaders() });
// };

export default {
  getPricingsForReseller,
  setResellerPricing,
  deleteResellerPricing,
  // batchUpdateResellerPricings,
};
