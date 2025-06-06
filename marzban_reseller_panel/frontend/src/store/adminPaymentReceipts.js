import { defineStore } from 'pinia';
import adminPaymentReceiptService from '@/services/adminPaymentReceiptService'; // To be created

export const useAdminPaymentReceiptsStore = defineStore('adminPaymentReceipts', {
  state: () => ({
    receipts: [], // Can be an object with keys for different statuses, e.g., { pending: [], approved: [], rejected: [] }
    loading: false,
    error: null,
    // activeFilter: 'pending', // To keep track of the current view/filter
  }),
  getters: {
    getReceipts: (state) => state.receipts,
    isLoading: (state) => state.loading,
    getError: (state) => state.error,
    // getActiveFilter: (state) => state.activeFilter,
  },
  actions: {
    // statusFilter can be 'pending', 'approved', 'rejected'
    async fetchReceipts(statusFilter = 'pending') {
      this.loading = true;
      this.error = null;
      // this.activeFilter = statusFilter;
      try {
        const response = await adminPaymentReceiptService.getPaymentReceipts(statusFilter);
        this.receipts = response.data; // Assuming API returns array in 'data'
      } catch (err) {
        this.error = err.response?.data?.detail || err.message || `Failed to fetch ${statusFilter} receipts`;
        this.receipts = [];
      } finally {
        this.loading = false;
      }
    },
    async approveReceipt(receiptId, currentStatusFilter = 'pending') {
      this.loading = true; // Or a specific 'actionLoading' state
      this.error = null;
      try {
        await adminPaymentReceiptService.approvePaymentReceipt(receiptId);
        await this.fetchReceipts(currentStatusFilter); // Refresh the current list
      } catch (err) {
        this.error = err.response?.data?.detail || err.message || 'Failed to approve receipt';
        throw err; // Re-throw for component to handle
      } finally {
        this.loading = false;
      }
    },
    async rejectReceipt(receiptId, rejectionReason, currentStatusFilter = 'pending') {
      this.loading = true; // Or a specific 'actionLoading' state
      this.error = null;
      try {
        await adminPaymentReceiptService.rejectPaymentReceipt(receiptId, rejectionReason);
        await this.fetchReceipts(currentStatusFilter); // Refresh the current list
      } catch (err) {
        this.error = err.response?.data?.detail || err.message || 'Failed to reject receipt';
        throw err; // Re-throw for component to handle
      } finally {
        this.loading = false;
      }
    },
  },
});
