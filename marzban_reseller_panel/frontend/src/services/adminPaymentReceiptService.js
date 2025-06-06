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

// Get payment receipts, optionally filtered by status
const getPaymentReceipts = async (status = null) => {
  const params = {};
  if (status) {
    params.status = status;
  }
  return apiClient.get('/admin/payment-receipts/', { params, headers: getAuthHeaders() });
};

// Approve a payment receipt
const approvePaymentReceipt = async (id) => {
  return apiClient.patch(`/admin/payment-receipts/${id}/approve`, {}, { headers: getAuthHeaders() });
  // Empty object {} as PATCH body if no specific payload is needed for approval itself
};

// Reject a payment receipt
const rejectPaymentReceipt = async (id, reason) => {
  // Backend expects: AdminPaymentReceiptReject(rejection_reason: str)
  const payload = { rejection_reason: reason };
  return apiClient.patch(`/admin/payment-receipts/${id}/reject`, payload, { headers: getAuthHeaders() });
};

export default {
  getPaymentReceipts,
  approvePaymentReceipt,
  rejectPaymentReceipt,
};
