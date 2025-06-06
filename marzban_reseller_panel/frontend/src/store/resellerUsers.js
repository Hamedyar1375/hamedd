import { defineStore } from 'pinia';
import resellerUserService from '@/services/resellerUserService'; // To be created

export const useResellerUsersStore = defineStore('resellerUsers', {
  state: () => ({
    users: [], // Array of MarzbanUserRead objects
    pagination: { // For server-side pagination
      currentPage: 1,
      pageSize: 10,
      totalItems: 0,
    },
    selectedUser: null, // For user details or edit form
    userUsage: null,    // For specific user's usage data

    // Loading states
    loadingUsers: false,
    loadingUserDetails: false,
    loadingUsage: false,
    submittingUser: false, // For create/update operations
    deletingUser: false,

    // Error states
    errorUsers: null,
    errorUserDetails: null,
    errorUsage: null,
    errorSubmit: null,
    errorDelete: null,

    // Data for forms - might be populated by other stores or API calls
    // accessibleMarzbanPanels: [], // Panels the reseller can use
    // availablePricingPlans: [], // Plans available to the reseller (with their pricing)
  }),
  getters: {
    getUsers: (state) => state.users,
    getPagination: (state) => state.pagination,
    getSelectedUser: (state) => state.selectedUser,
    getUserUsage: (state) => state.userUsage,
    // Add other getters as needed
  },
  actions: {
    async fetchUsers(params = {}) {
      this.loadingUsers = true;
      this.errorUsers = null;
      try {
        // Include pagination params
        const apiParams = {
            skip: (params.page || this.pagination.currentPage - 1) * (params.pageSize || this.pagination.pageSize),
            limit: params.pageSize || this.pagination.pageSize,
            ...params // Other filters like username search, status
        };
        const response = await resellerUserService.getResellerUsers(apiParams);
        // Assuming backend returns { items: [], total: number } for pagination
        this.users = response.data.items;
        this.pagination.totalItems = response.data.total;
        this.pagination.currentPage = (params.page || this.pagination.currentPage);
        this.pagination.pageSize = (params.pageSize || this.pagination.pageSize);

      } catch (err) {
        this.errorUsers = err.response?.data?.detail || err.message || 'Failed to fetch users';
        this.users = [];
        this.pagination.totalItems = 0;
      } finally {
        this.loadingUsers = false;
      }
    },
    async fetchUserDetail(userId) {
      this.loadingUserDetails = true;
      this.errorUserDetails = null;
      this.selectedUser = null;
      try {
        const response = await resellerUserService.getResellerUserDetail(userId);
        this.selectedUser = response.data;
      } catch (err) {
        this.errorUserDetails = err.response?.data?.detail || err.message || 'Failed to fetch user details';
      } finally {
        this.loadingUserDetails = false;
      }
    },
    async fetchUserUsage(userId) {
      this.loadingUsage = true;
      this.errorUsage = null;
      this.userUsage = null;
      try {
        const response = await resellerUserService.getResellerUserUsage(userId);
        this.userUsage = response.data;
      } catch (err) {
        this.errorUsage = err.response?.data?.detail || err.message || 'Failed to fetch user usage';
      } finally {
        this.loadingUsage = false;
      }
    },
    async createUser(userData) {
      this.submittingUser = true;
      this.errorSubmit = null;
      try {
        await resellerUserService.createResellerUser(userData);
        await this.fetchUsers({ page: 1, pageSize: this.pagination.pageSize }); // Refresh user list to first page
      } catch (err) {
        this.errorSubmit = err.response?.data?.detail || err.message || 'Failed to create user';
        throw err;
      } finally {
        this.submittingUser = false;
      }
    },
    async updateUser(userId, userData) {
      this.submittingUser = true;
      this.errorSubmit = null;
      try {
        await resellerUserService.updateResellerUser(userId, userData);
        // Refresh current page of users list, or specific user details if viewed
        await this.fetchUsers({ page: this.pagination.currentPage, pageSize: this.pagination.pageSize });
        if (this.selectedUser && this.selectedUser.id === userId) {
            await this.fetchUserDetail(userId); // Refresh selected user details if it was open
        }
      } catch (err) {
        this.errorSubmit = err.response?.data?.detail || err.message || 'Failed to update user';
        throw err;
      } finally {
        this.submittingUser = false;
      }
    },
    async deleteUser(userId) {
      this.deletingUser = true; // Could use a specific loading state or general one
      this.errorDelete = null;
      try {
        await resellerUserService.deleteResellerUser(userId);
        await this.fetchUsers({ page: this.pagination.currentPage, pageSize: this.pagination.pageSize }); // Refresh user list
      } catch (err) {
        this.errorDelete = err.response?.data?.detail || err.message || 'Failed to delete user';
        throw err;
      } finally {
        this.deletingUser = false;
      }
    },

    // Actions to populate form selection data (panels, plans)
    // These might call other stores or dedicated services.
    // For now, assuming this data is fetched by the component that needs it,
    // or passed as props if fetched by a parent view.
    // async fetchAccessiblePanels() { ... }
    // async fetchAvailablePlans() { ... }
  },
});
