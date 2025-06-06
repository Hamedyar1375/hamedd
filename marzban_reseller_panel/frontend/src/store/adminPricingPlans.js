import { defineStore } from 'pinia';
import adminPricingPlanService from '@/services/adminPricingPlanService'; // To be created

export const useAdminPricingPlansStore = defineStore('adminPricingPlans', {
  state: () => ({
    plans: [],
    loading: false,
    error: null,
  }),
  getters: {
    getPlans: (state) => state.plans,
    isLoading: (state) => state.loading,
    getError: (state) => state.error,
  },
  actions: {
    async fetchPlans() {
      this.loading = true;
      this.error = null;
      try {
        const response = await adminPricingPlanService.getAllPricingPlans();
        this.plans = response.data; // Assuming API returns array in 'data'
      } catch (err) {
        this.error = err.response?.data?.detail || err.message || 'Failed to fetch pricing plans';
        this.plans = [];
      } finally {
        this.loading = false;
      }
    },
    async addPlan(planData) {
      this.loading = true;
      this.error = null;
      try {
        await adminPricingPlanService.createPricingPlan(planData);
        await this.fetchPlans(); // Refresh list
      } catch (err) {
        this.error = err.response?.data?.detail || err.message || 'Failed to add pricing plan';
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async updatePlan(planId, planData) {
      this.loading = true;
      this.error = null;
      try {
        await adminPricingPlanService.updatePricingPlan(planId, planData);
        await this.fetchPlans(); // Refresh list
      } catch (err) {
        this.error = err.response?.data?.detail || err.message || 'Failed to update pricing plan';
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async deletePlan(planId) {
      this.loading = true;
      this.error = null;
      try {
        await adminPricingPlanService.deletePricingPlan(planId);
        await this.fetchPlans(); // Refresh list
      } catch (err) {
        this.error = err.response?.data?.detail || err.message || 'Failed to delete pricing plan';
      } finally {
        this.loading = false;
      }
    },
  },
});
