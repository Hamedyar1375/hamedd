import { defineStore } from 'pinia';
import adminSyncService from '@/services/adminSyncService'; // To be created
// May need to fetch Marzban panels for selection, can be done in component or here
// import { useAdminMarzbanPanelsStore } from './adminMarzbanPanels';

export const useAdminSyncStore = defineStore('adminSync', {
  state: () => ({
    // Example structure for syncStatus. Adjust based on actual backend response.
    // Could include last_sync_time, current_task_description, overall_status, errors_count etc.
    syncStatus: null,
    // For specific task loading, e.g. { panelId_users: true, panelId_all: false }
    taskLoading: {},
    loading: false, // General loading for fetching status or history
    error: null,
    syncHistory: [], // Optional: if backend provides history
  }),
  getters: {
    getSyncStatus: (state) => state.syncStatus,
    isTaskLoading: (state) => (taskId) => !!state.taskLoading[taskId], // Check loading for specific task
    isLoading: (state) => state.loading,
    getError: (state) => state.error,
    getSyncHistory: (state) => state.syncHistory,
  },
  actions: {
    async fetchSyncStatus() {
      this.loading = true;
      this.error = null;
      try {
        const response = await adminSyncService.getSyncStatus();
        this.syncStatus = response.data;
      } catch (err) {
        this.error = err.response?.data?.detail || err.message || 'Failed to fetch sync status';
        this.syncStatus = null;
      } finally {
        this.loading = false;
      }
    },
    // panelId is the ID of the Marzban panel to sync with
    async triggerUserSync(panelId) {
      const taskId = `users_panel_${panelId}`;
      this.taskLoading = { ...this.taskLoading, [taskId]: true };
      this.error = null; // Clear general error, or use task-specific error state
      try {
        const response = await adminSyncService.startUserSync(panelId);
        // After triggering, refresh status or update UI based on response
        // The response might include a task ID or immediate status.
        // For now, we assume it's fire-and-forget, status is updated separately.
        // await this.fetchSyncStatus(); // Or rely on user to refresh status manually
        return response.data; // Return response for component to handle (e.g. success message)
      } catch (err) {
        this.error = err.response?.data?.detail || err.message || `Failed to trigger user sync for panel ${panelId}`;
        throw err;
      } finally {
        this.taskLoading = { ...this.taskLoading, [taskId]: false };
      }
    },
    async triggerFullSync(panelId) {
      const taskId = `all_panel_${panelId}`;
      this.taskLoading = { ...this.taskLoading, [taskId]: true };
      this.error = null;
      try {
        const response = await adminSyncService.startFullSync(panelId);
        // await this.fetchSyncStatus();
        return response.data;
      } catch (err) {
        this.error = err.response?.data?.detail || err.message || `Failed to trigger full sync for panel ${panelId}`;
        throw err;
      } finally {
        this.taskLoading = { ...this.taskLoading, [taskId]: false };
      }
    },
    // Optional: if backend provides sync history
    // async fetchSyncHistory() {
    //   this.loading = true;
    //   this.error = null;
    //   try {
    //     const response = await adminSyncService.getSyncHistory(); // Assuming this endpoint exists
    //     this.syncHistory = response.data;
    //   } catch (err) {
    //     this.error = err.response?.data?.detail || 'Failed to fetch sync history';
    //     this.syncHistory = [];
    //   } finally {
    //     this.loading = false;
    //   }
    // },
  },
});
