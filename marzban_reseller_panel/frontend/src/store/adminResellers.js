import { defineStore } from 'pinia';
import adminResellerService from '@/services/adminResellerService'; // To be created
import adminMarzbanPanelService from '@/services/adminMarzbanPanelService'; // Existing service

export const useAdminResellersStore = defineStore('adminResellers', {
  state: () => ({
    resellers: [],
    marzbanPanels: [], // For selection when assigning panel access
    loading: false,
    error: null,
    panelAccessLoading: false, // Separate loading for panel access
    panelAccessError: null,   // Separate error for panel access
  }),
  getters: {
    getResellers: (state) => state.resellers,
    getMarzbanPanels: (state) => state.marzbanPanels,
    isLoading: (state) => state.loading,
    getError: (state) => state.error,
    isPanelAccessLoading: (state) => state.panelAccessLoading,
    getPanelAccessError: (state) => state.panelAccessError,
  },
  actions: {
    async fetchResellers(skip = 0, limit = 100) {
      this.loading = true;
      this.error = null;
      try {
        const response = await adminResellerService.getAllResellers(skip, limit);
        this.resellers = response.data; // Assuming API returns array in 'data'
      } catch (err) {
        this.error = err.response?.data?.detail || err.message || 'Failed to fetch resellers';
        this.resellers = [];
      } finally {
        this.loading = false;
      }
    },
    async fetchMarzbanPanelsForSelection() {
      // This action specifically fetches panels for selection purposes,
      // to avoid interfering with the main panel store if it's used elsewhere differently.
      // It could also directly use useAdminMarzbanPanelsStore().fetchPanels() if appropriate.
      this.panelAccessLoading = true; // Use separate loading for this context if needed
      this.panelAccessError = null;
      try {
        const response = await adminMarzbanPanelService.getAllMarzbanPanels();
        this.marzbanPanels = response.data;
      } catch (err) {
        this.panelAccessError = err.response?.data?.detail || err.message || 'Failed to fetch Marzban panels';
        this.marzbanPanels = [];
      } finally {
        this.panelAccessLoading = false;
      }
    },
    async addReseller(resellerData) {
      this.loading = true;
      this.error = null;
      try {
        await adminResellerService.createReseller(resellerData);
        await this.fetchResellers(); // Refresh list
      } catch (err) {
        this.error = err.response?.data?.detail || err.message || 'Failed to add reseller';
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async updateReseller(resellerId, resellerData) {
      this.loading = true;
      this.error = null;
      try {
        await adminResellerService.updateReseller(resellerId, resellerData);
        await this.fetchResellers(); // Refresh list
      } catch (err) {
        this.error = err.response?.data?.detail || err.message || 'Failed to update reseller';
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async deleteReseller(resellerId) {
      this.loading = true;
      this.error = null;
      try {
        await adminResellerService.deleteReseller(resellerId);
        await this.fetchResellers(); // Refresh list
      } catch (err) {
        this.error = err.response?.data?.detail || err.message || 'Failed to delete reseller';
      } finally {
        this.loading = false;
      }
    },
    async fetchResellerPanelAccess(resellerId) {
        // This is a helper to get current access, not directly part of the store's state management of all resellers
        // but can be used by a component before updating.
        this.panelAccessLoading = true;
        this.panelAccessError = null;
        try {
            const response = await adminResellerService.getResellerPanelAccess(resellerId);
            return response.data; // Returns list of panel objects or just IDs
        } catch (err) {
            this.panelAccessError = err.response?.data?.detail || err.message || 'Failed to fetch reseller panel access';
            throw err;
        } finally {
            this.panelAccessLoading = false;
        }
    },
    async updateResellerPanelAccess(resellerId, panelIds) {
      this.panelAccessLoading = true;
      this.panelAccessError = null;
      try {
        await adminResellerService.updateResellerPanelAccess(resellerId, panelIds);
        // No need to call fetchResellers() unless panel access info is part of the main reseller object list
        // Typically, you'd just confirm success to the user.
      } catch (err) {
        this.panelAccessError = err.response?.data?.detail || err.message || 'Failed to update reseller panel access';
        throw err;
      } finally {
        this.panelAccessLoading = false;
      }
    },
  },
});
