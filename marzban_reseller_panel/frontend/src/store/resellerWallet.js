import { defineStore } from 'pinia';
import resellerWalletService from '@/services/resellerWalletService'; // To be created

export const useResellerWalletStore = defineStore('resellerWallet', {
  state: () => ({
    balance: null, // Could be a number or an object like { amount: 0, currency: 'USD' }
    transactions: [],
    loadingBalance: false,
    loadingTransactions: false,
    submittingTopUp: false,
    error: {
      balance: null,
      transactions: null,
      topUp: null,
    },
  }),
  getters: {
    getBalance: (state) => state.balance,
    getTransactions: (state) => state.transactions,
    isLoadingBalance: (state) => state.loadingBalance,
    isLoadingTransactions: (state) => state.loadingTransactions,
    isSubmittingTopUp: (state) => state.submittingTopUp,
    getBalanceError: (state) => state.error.balance,
    getTransactionsError: (state) => state.error.transactions,
    getTopUpError: (state) => state.error.topUp,
  },
  actions: {
    async fetchWalletBalance() {
      this.loadingBalance = true;
      this.error.balance = null;
      try {
        const response = await resellerWalletService.getWalletBalance();
        // Assuming backend returns something like { "balance": 100.00, "currency": "USD" }
        // or just the balance value. Adapt as needed.
        this.balance = response.data;
      } catch (err) {
        this.error.balance = err.response?.data?.detail || err.message || 'Failed to fetch wallet balance';
        this.balance = null;
      } finally {
        this.loadingBalance = false;
      }
    },
    async fetchTransactionHistory(params = {}) { // params for period, pagination, type
      this.loadingTransactions = true;
      this.error.transactions = null;
      try {
        const response = await resellerWalletService.getTransactionHistory(params);
        this.transactions = response.data; // Assuming API returns array in 'data'
      } catch (err) {
        this.error.transactions = err.response?.data?.detail || err.message || 'Failed to fetch transaction history';
        this.transactions = [];
      } finally {
        this.loadingTransactions = false;
      }
    },
    async requestTopUp(topUpData) {
      // topUpData: { amount: number, proof_details: string, payment_method_id (optional): number }
      this.submittingTopUp = true;
      this.error.topUp = null;
      try {
        const response = await resellerWalletService.submitTopUpRequest(topUpData);
        // Optionally, refresh balance or transactions, or rely on user/next load
        // await this.fetchWalletBalance(); // Might be good to refresh balance
        return response.data; // Return response for component to handle (e.g. success message)
      } catch (err) {
        this.error.topUp = err.response?.data?.detail || err.message || 'Failed to submit top-up request';
        throw err; // Re-throw for component to display specific error
      } finally {
        this.submittingTopUp = false;
      }
    },
  },
});
