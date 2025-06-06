import { defineStore } from 'pinia';
import adminReportService from '@/services/adminReportService'; // To be created

export const useAdminReportsStore = defineStore('adminReports', {
  state: () => ({
    salesReport: null, // Can be structured { labels: [], datasets: [{ label: '', data: [] }] }
    usageByResellerReport: null, // Similar structure or raw data array
    // Add other report states as needed e.g. panelUsageReport: null
    loading: {
        sales: false,
        usageByReseller: false,
        // panelUsage: false,
    },
    error: {
        sales: null,
        usageByReseller: null,
        // panelUsage: null,
    },
  }),
  getters: {
    getSalesReport: (state) => state.salesReport,
    getUsageByResellerReport: (state) => state.usageByResellerReport,
    isLoadingSalesReport: (state) => state.loading.sales,
    isLoadingUsageByResellerReport: (state) => state.loading.usageByReseller,
    getSalesReportError: (state) => state.error.sales,
    getUsageByResellerReportError: (state) => state.error.usageByReseller,
  },
  actions: {
    async fetchSalesReport(period = 'last30days') { // Default period
      this.loading.sales = true;
      this.error.sales = null;
      try {
        const response = await adminReportService.getSalesReport(period);
        // Assuming backend returns data directly, or adapt if it's { data: ... }
        // Also assuming backend might return data that needs transformation for chartjs
        this.salesReport = response.data;
      } catch (err) {
        this.error.sales = err.response?.data?.detail || err.message || 'Failed to fetch sales report';
        this.salesReport = null;
      } finally {
        this.loading.sales = false;
      }
    },
    async fetchUsageByResellerReport(period = 'last30days') {
      this.loading.usageByReseller = true;
      this.error.usageByReseller = null;
      try {
        const response = await adminReportService.getUsageByResellerReport(period);
        this.usageByResellerReport = response.data;
      } catch (err) {
        this.error.usageByReseller = err.response?.data?.detail || err.message || 'Failed to fetch usage by reseller report';
        this.usageByResellerReport = null;
      } finally {
        this.loading.usageByReseller = false;
      }
    },
    // Example for another report type
    // async fetchPanelUsageReport(panelId, period = 'last30days') {
    //   this.loading.panelUsage = true;
    //   this.error.panelUsage = null;
    //   try {
    //     const response = await adminReportService.getPanelUsageReport(panelId, period);
    //     this.panelUsageReport = response.data;
    //   } catch (err) {
    //     this.error.panelUsage = err.response?.data?.detail || 'Failed to fetch panel usage report';
    //     this.panelUsageReport = null;
    //   } finally {
    //     this.loading.panelUsage = false;
    //   }
    // },
  },
});
