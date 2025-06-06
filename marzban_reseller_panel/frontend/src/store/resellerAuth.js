import { defineStore } from 'pinia';
import resellerAuthService from '@/services/resellerAuthService'; // Will create this next
import router from '@/router'; // Import router for navigation

export const useResellerAuthStore = defineStore('resellerAuth', {
  state: () => ({
    token: localStorage.getItem('reseller_token') || null,
    resellerUser: JSON.parse(localStorage.getItem('reseller_user')) || null,
    status: 'idle', // 'idle', 'loading', 'succeeded', 'failed'
    error: null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    getResellerUser: (state) => state.resellerUser,
    getStatus: (state) => state.status,
    getError: (state) => state.error,
  },
  actions: {
    async login(credentials) {
      this.status = 'loading';
      this.error = null;
      try {
        const responseData = await resellerAuthService.loginReseller(credentials.username, credentials.password);

        const token = responseData.access_token;
        if (!token) {
            throw new Error("Token not found in response");
        }
        this.token = token;
        localStorage.setItem('reseller_token', token);

        // Optionally fetch reseller details
        try {
            const userDetails = await resellerAuthService.fetchResellerMe();
            this.resellerUser = userDetails;
            localStorage.setItem('reseller_user', JSON.stringify(userDetails));
        } catch (userError) {
            console.warn('Failed to fetch reseller user details after login:', userError);
            this.resellerUser = null; // Or handle as partial success
        }

        this.status = 'succeeded';
        return true;
      } catch (err) {
        this.status = 'failed';
        this.error = err.response?.data?.detail || err.message || 'An unknown error occurred';
        this.token = null;
        this.resellerUser = null;
        localStorage.removeItem('reseller_token');
        localStorage.removeItem('reseller_user');
        return false;
      }
    },
    logout() {
      this.token = null;
      this.resellerUser = null;
      this.status = 'idle';
      this.error = null;
      localStorage.removeItem('reseller_token');
      localStorage.removeItem('reseller_user');
      router.push({ name: 'ResellerLogin' });
    },
    async checkAuth() {
      const token = localStorage.getItem('reseller_token');
      if (token) {
        this.token = token; // Set token from localStorage
        this.status = 'loading';
        try {
          const userDetails = await resellerAuthService.fetchResellerMe();
          this.resellerUser = userDetails;
          localStorage.setItem('reseller_user', JSON.stringify(userDetails));
          this.status = 'succeeded';
        } catch (err) {
          console.warn('Reseller token validation failed or user fetch failed:', err);
          // Don't logout immediately, as fetchResellerMe in service will pass token
          // If that call fails due to auth, the service/interceptor should handle it,
          // or we rely on user being unable to access protected resources.
          // For now, just mark as failed. The token might be valid but user endpoint is down.
          this.status = 'failed';
          this.error = 'Session check failed. User details might be unavailable.';
          // To be more strict, one could call this.logout() here:
          // this.logout();
          // this.error = 'Session expired or invalid. Please login again.';
        }
      } else {
        this.status = 'idle'; // No token found
      }
    },
    async updateProfile(profileData) {
      // 'profileData' should match the ResellerProfileUpdate schema from backend
      // e.g., { email, full_name, password (optional new password) }
      // It might also need current_password for verification if backend requires it.
      this.status = 'loading'; // Consider a different status, e.g., 'updating_profile'
      this.error = null;
      try {
        const updatedUserDetails = await resellerAuthService.updateResellerProfile(profileData);
        this.resellerUser = updatedUserDetails; // Update user state with response
        localStorage.setItem('reseller_user', JSON.stringify(updatedUserDetails));
        this.status = 'succeeded'; // Or 'profile_updated_successfully'
        return true;
      } catch (err) {
        this.status = 'failed'; // Or 'profile_update_failed'
        this.error = err.response?.data?.detail || err.message || 'Failed to update profile';
        // Do not clear user data or token here, as the session is likely still valid.
        throw err; // Re-throw for component to handle and display specific error
      }
    },
    // Action to specifically re-fetch reseller user data if needed elsewhere
    async refreshResellerUser() {
        if (!this.token) return; // No token, nothing to refresh
        this.status = 'loading';
        try {
            const userDetails = await resellerAuthService.fetchResellerMe();
            this.resellerUser = userDetails;
            localStorage.setItem('reseller_user', JSON.stringify(userDetails));
            this.status = 'succeeded';
        } catch (error) {
            this.status = 'failed';
            // this.error = "Failed to refresh user data."; // Set error or handle silently
            console.error("Failed to refresh reseller user data:", error);
        }
    }
  },
});
