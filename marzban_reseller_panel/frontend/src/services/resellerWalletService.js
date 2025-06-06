import apiClient from './api';

// Helper function to get authorization headers for the reseller.
const getResellerAuthHeaders = () => {
  const token = localStorage.getItem('reseller_token');
  if (!token) {
    console.warn('Reseller token not found for API request.');
    // This should ideally be handled by routing guards.
    // Throwing an error or returning empty headers depends on the desired error handling strategy.
    return {};
  }
  return {
    'Authorization': `Bearer ${token}`,
  };
};

// Get current wallet balance/status
const getWalletBalance = async () => {
  // Corresponds to GET /reseller/wallet/status in main.py
  // The backend returns ResellerWalletStatus(balance: float, currency: str = "USD")
  return apiClient.get('/reseller/wallet/status', { headers: getResellerAuthHeaders() });
};

// Get transaction history
const getTransactionHistory = async (params = {}) => {
  // Corresponds to GET /reseller/wallet/transactions in main.py
  // Backend might support pagination via query params (e.g., skip, limit)
  // Or date range filters (e.g., start_date, end_date)
  return apiClient.get('/reseller/wallet/transactions', {
    params,
    headers: getResellerAuthHeaders(),
  });
};

// Submit a new top-up request (payment receipt)
const submitTopUpRequest = async (data) => {
  // Corresponds to POST /reseller/wallet/payment-receipts in main.py
  // Backend expects ResellerPaymentReceiptCreate(amount: float, proof_details: str)
  // 'proof_details' could be a transaction ID, reference number, or notes from the reseller.
  return apiClient.post('/reseller/wallet/payment-receipts', data, { headers: getResellerAuthHeaders() });
};

export default {
  getWalletBalance,
  getTransactionHistory,
  submitTopUpRequest,
};
