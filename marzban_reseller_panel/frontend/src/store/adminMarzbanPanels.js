import { defineStore } from 'pinia';
import adminMarzbanPanelService from '@/services/adminMarzbanPanelService'; // Will create this next

export const useAdminMarzbanPanelsStore = defineStore('adminMarzbanPanels', {
  state: () => ({
    panels: [],
    loading: false,
    error: null,
  }),
  getters: {
    getPanels: (state) => state.panels,
    isLoading: (state) => state.loading,
    getError: (state) => state.error,
  },
  actions: {
    async fetchPanels() {
      this.loading = true;
      this.error = null;
      try {
        const response = await adminMarzbanPanelService.getAllMarzbanPanels();
        this.panels = response.data; // Assuming API returns array in 'data'
      } catch (err) {
        this.error = err.response?.data?.detail || err.message || 'Failed to fetch panels';
        this.panels = []; // Clear panels on error
      } finally {
        this.loading = false;
      }
    },
    async addPanel(panelData) {
      this.loading = true;
      this.error = null;
      try {
        await adminMarzbanPanelService.createMarzbanPanel(panelData);
        await this.fetchPanels(); // Refresh panel list
      } catch (err) {
        this.error = err.response?.data?.detail || err.message || 'Failed to add panel';
        throw err; // Re-throw to allow form to handle it
      } finally {
        this.loading = false;
      }
    },
    async updatePanel(panelId, panelData) {
      this.loading = true;
      this.error = null;
      try {
        await adminMarzbanPanelService.updateMarzbanPanel(panelId, panelData);
        await this.fetchPanels(); // Refresh panel list
      } catch (err) {
        this.error = err.response?.data?.detail || err.message || 'Failed to update panel';
        throw err; // Re-throw to allow form to handle it
      } finally {
        this.loading = false;
      }
    },
    async deletePanel(panelId) {
      this.loading = true;
      this.error = null;
      try {
        await adminMarzbanPanelService.deleteMarzbanPanel(panelId);
        await this.fetchPanels(); // Refresh panel list
      } catch (err) {
        this.error = err.response?.data?.detail || err.message || 'Failed to delete panel';
        // Optionally, you might want to handle the error differently for delete
        // e.g., not clearing the whole list if one delete fails but notifying user
      } finally {
        this.loading = false;
      }
    },
  },
});
