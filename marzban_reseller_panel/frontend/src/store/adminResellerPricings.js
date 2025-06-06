import { defineStore } from 'pinia';
import adminResellerPricingService from '@/services/adminResellerPricingService'; // To be created
// It might also need to fetch resellers and plans for selection, or assume they are loaded by other stores/views
// import { useAdminResellersStore } from './adminResellers';
// import { useAdminPricingPlansStore } from './adminPricingPlans';

export const useAdminResellerPricingsStore = defineStore('adminResellerPricings', {
  state: () => ({
    // Stores pricing overrides for a *single selected reseller*
    // Format: { plan_id: custom_price, ... } or an array of override objects { id, reseller_id, pricing_plan_id, custom_price }
    // The backend response for GET /reseller-pricings/{reseller_id} will dictate this structure.
    // Let's assume it's an array of objects: [{ id (override_id), pricing_plan_id, custom_price, reseller_id (implicit) }]
    currentResellerPricings: [],
    loading: false,
    error: null,
  }),
  getters: {
    getPricingsForCurrentReseller: (state) => state.currentResellerPricings,
    isLoading: (state) => state.loading,
    getError: (state) => state.error,
  },
  actions: {
    async fetchPricingsForReseller(resellerId) {
      this.loading = true;
      this.error = null;
      try {
        const response = await adminResellerPricingService.getPricingsForReseller(resellerId);
        this.currentResellerPricings = response.data; // Assuming API returns array
      } catch (err) {
        this.error = err.response?.data?.detail || err.message || 'Failed to fetch reseller-specific pricings';
        this.currentResellerPricings = [];
      } finally {
        this.loading = false;
      }
    },
    async setResellerPricing(resellerId, planId, customPrice) {
      this.loading = true;
      this.error = null;
      try {
        const payload = {
          reseller_id: resellerId,
          pricing_plan_id: planId,
          custom_price: customPrice,
        };
        await adminResellerPricingService.setResellerPricing(payload);
        // After setting, refresh the pricings for the current reseller
        await this.fetchPricingsForReseller(resellerId);
      } catch (err) {
        this.error = err.response?.data?.detail || err.message || 'Failed to set reseller pricing';
        throw err; // Re-throw for component to handle
      } finally {
        this.loading = false;
      }
    },
    async deleteResellerPricing(overrideId, resellerIdToRefresh) {
      // overrideId is the ID of the reseller_pricing record itself
      this.loading = true;
      this.error = null;
      try {
        await adminResellerPricingService.deleteResellerPricing(overrideId);
        // After deleting, refresh the pricings for the current reseller
        if (resellerIdToRefresh) {
            await this.fetchPricingsForReseller(resellerIdToRefresh);
        } else {
            // Or clear currentResellerPricings if no resellerId is contextually available for refresh
            this.currentResellerPricings = [];
        }
      } catch (err) {
        this.error = err.response?.data?.detail || err.message || 'Failed to delete reseller pricing';
        throw err; // Re-throw for component to handle
      } finally {
        this.loading = false;
      }
    },
    // If using batch update:
    // async batchUpdateResellerPricings(resellerId, pricingsArray) {
    //   this.loading = true;
    //   this.error = null;
    //   try {
    //     await adminResellerPricingService.batchUpdateResellerPricings(resellerId, pricingsArray);
    //     await this.fetchPricingsForReseller(resellerId);
    //   } catch (err) {
    //     this.error = err.response?.data?.detail || 'Failed to batch update reseller pricings';
    //     throw err;
    //   } finally {
    //     this.loading = false;
    //   }
    // },
    clearCurrentResellerPricings() {
        this.currentResellerPricings = [];
        this.error = null;
    }
  },
});
