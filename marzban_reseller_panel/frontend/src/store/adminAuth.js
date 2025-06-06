import { defineStore } from 'pinia';
import adminAuthService from '@/services/adminAuthService'; // Use the dedicated service
import router from '@/router'; // Import router for navigation

export const useAdminAuthStore = defineStore('adminAuth', {
  state: () => ({
    token: localStorage.getItem('admin_token') || null,
    adminUser: JSON.parse(localStorage.getItem('admin_user')) || null,
    status: 'idle', // 'idle', 'loading', 'succeeded', 'failed'
    error: null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    getAdminUser: (state) => state.adminUser,
    getStatus: (state) => state.status,
    getError: (state) => state.error,
  },
  actions: {
    async login(credentials) {
      this.status = 'loading';
      this.error = null;
      try {
        const responseData = await adminAuthService.loginAdmin(credentials.username, credentials.password);

        const token = responseData.access_token;
        if (!token) {
            throw new Error("Token not found in response");
        }
        this.token = token;
        localStorage.setItem('admin_token', token);

        // Optionally fetch user details
        // The token should be automatically added by the Axios interceptor now if configured for admin_token
        try {
            const userDetails = await adminAuthService.fetchAdminMe();
            this.adminUser = userDetails;
            localStorage.setItem('admin_user', JSON.stringify(userDetails));
        } catch (userError) {
            console.warn('Failed to fetch admin user details after login:', userError);
            this.adminUser = null; // Or handle as partial success
        }

        this.status = 'succeeded';
        return true;
      } catch (err) {
        this.status = 'failed';
        this.error = err.response?.data?.detail || err.message || 'An unknown error occurred';
        this.token = null;
        this.adminUser = null;
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        return false;
      }
    },
    logout() {
      this.token = null;
      this.adminUser = null;
      this.status = 'idle';
      this.error = null;
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      localStorage.removeItem('user_role'); // Clearing old role if any
      // Assuming router is imported correctly for navigation
      router.push({ name: 'AdminLogin' });
    },
    async checkAuth() {
      const token = localStorage.getItem('admin_token');
      if (token) {
        this.token = token;
        this.status = 'loading';
        try {
          // The token from localStorage is already set to state.token by this point.
          // The interceptor in api.js should pick up this.token or localStorage.getItem('admin_token').
          const userDetails = await adminAuthService.fetchAdminMe();
          this.adminUser = userDetails;
          localStorage.setItem('admin_user', JSON.stringify(userDetails));
          this.status = 'succeeded';
        } catch (err) {
          console.warn('Token validation failed or user fetch failed:', err);
          this.logout(); // Token might be invalid or expired
          this.status = 'failed';
          this.error = 'Session expired or invalid. Please login again.';
        }
      } else {
        this.status = 'idle';
      }
    },
  },
});
