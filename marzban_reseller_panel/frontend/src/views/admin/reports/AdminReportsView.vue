<template>
  <div class="admin-reports-view">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>Admin Reports</span>
        </div>
      </template>

      <el-tabs v-model="activeReportTab" @tab-click="handleReportTabClick">
        <el-tab-pane label="Sales Report" name="sales">
          <ReportControls :loading="reportsStore.isLoadingSalesReport" @fetch="fetchCurrentReport" />
          <div v-if="reportsStore.isLoadingSalesReport" class="loading-state">
            <el-skeleton :rows="5" animated />
          </div>
          <div v-else-if="reportsStore.getSalesReportError" class="error-state">
            <el-alert :title="reportsStore.getSalesReportError" type="error" show-icon />
          </div>
          <div v-else-if="reportsStore.getSalesReport">
            <h4>Sales Data ({{ selectedPeriod.label }})</h4>
            <!-- Example: Displaying raw data or a simple table -->
            <!-- <pre>{{ reportsStore.getSalesReport }}</pre> -->
            <LineChart v-if="salesChartData" :chart-data="salesChartData" :chart-options="salesChartOptions" style="height: 400px;" />
            <el-empty v-else description="No sales data available for this period or data format is incorrect." />
          </div>
           <el-empty v-else description="Select a period and click Fetch Report." />
        </el-tab-pane>

        <el-tab-pane label="Usage by Reseller" name="usageByReseller">
          <ReportControls :loading="reportsStore.isLoadingUsageByResellerReport" @fetch="fetchCurrentReport" />
           <div v-if="reportsStore.isLoadingUsageByResellerReport" class="loading-state">
            <el-skeleton :rows="5" animated />
          </div>
          <div v-else-if="reportsStore.getUsageByResellerReportError" class="error-state">
            <el-alert :title="reportsStore.getUsageByResellerReportError" type="error" show-icon />
          </div>
          <div v-else-if="reportsStore.getUsageByResellerReport">
            <h4>Usage by Reseller ({{ selectedPeriod.label }})</h4>
            <!-- <pre>{{ reportsStore.getUsageByResellerReport }}</pre> -->
            <BarChart v-if="usageByResellerChartData" :chart-data="usageByResellerChartData" :chart-options="usageByResellerChartOptions" style="height: 400px;" />
             <el-empty v-else description="No usage data available for this period or data format is incorrect." />
          </div>
          <el-empty v-else description="Select a period and click Fetch Report." />
        </el-tab-pane>
        <!-- Add more tabs for other reports -->
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, defineAsyncComponent } from 'vue'; // Removed unused watch
import { useAdminReportsStore } from '@/store/adminReports';
// import { ElMessage } from 'element-plus'; // Removed as unused

// Reusable controls component (could be in a separate file)
const ReportControls = {
  props: ['loading'],
  emits: ['fetch'],
  setup(props, { emit }) {
    const selectedPeriod = ref({ value: 'last30days', label: 'Last 30 Days' });
    const periodOptions = ref([
      { value: 'last7days', label: 'Last 7 Days' },
      { value: 'last30days', label: 'Last 30 Days' },
      { value: 'this_month', label: 'This Month' },
      { value: 'last_month', label: 'Last Month' },
      // { value: 'this_year', label: 'This Year' },
    ]);
    const handleFetch = () => {
      emit('fetch', selectedPeriod.value);
    };
    return { selectedPeriod, periodOptions, handleFetch };
  },
  template: `
    <el-form :inline="true" @submit.prevent style="margin-bottom: 20px;">
      <el-form-item label="Select Period:">
        <el-select v-model="selectedPeriod" value-key="value" placeholder="Select period">
          <el-option v-for="item in periodOptions" :key="item.value" :label="item.label" :value="item" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleFetch" :loading="loading">Fetch Report</el-button>
      </el-form-item>
    </el-form>
  `
};

const LineChart = defineAsyncComponent(() => import('@/components/charts/LineChart.vue'));
const BarChart = defineAsyncComponent(() => import('@/components/charts/BarChart.vue'));

const reportsStore = useAdminReportsStore();
const activeReportTab = ref('sales');
const selectedPeriod = ref({ value: 'last30days', label: 'Last 30 Days' }); // To pass to chart title etc.

const fetchCurrentReport = async (periodData) => {
  selectedPeriod.value = periodData; // Keep track of selected period for display
  if (activeReportTab.value === 'sales') {
    await reportsStore.fetchSalesReport(periodData.value);
  } else if (activeReportTab.value === 'usageByReseller') {
    await reportsStore.fetchUsageByResellerReport(periodData.value);
  }
  // Add other report types here
};

const handleReportTabClick = () => { // _tab removed as unused
  // activeReportTab is updated by v-model.
  // Clear previous report data or let ReportControls trigger new fetch.
  // For now, we assume ReportControls will be used to fetch for the new tab.
  // Optionally, reset period or auto-fetch:
  // selectedPeriod.value = { value: 'last30days', label: 'Last 30 Days' }; // Reset period
  // fetchCurrentReport(selectedPeriod.value); // Auto-fetch on tab click
};

// --- Chart Data Transformations (Examples) ---
// These would need to be adjusted based on the actual API response structure.

const salesChartData = computed(() => {
  const report = reportsStore.getSalesReport;
  if (!report || !Array.isArray(report.labels) || !Array.isArray(report.datasets)) { // Basic check
      if(report) console.warn("Sales report data is not in expected chart.js format:", report);
      return null;
  }
  // Assuming backend returns data in Chart.js compatible format:
  // { labels: ['Day1', 'Day2'], datasets: [{ label: 'Sales', data: [100, 120] }] }
  return report;
});

const salesChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: true },
    title: { display: true, text: `Sales Report - ${selectedPeriod.value.label}` }
  }
}));

const usageByResellerChartData = computed(() => {
  const report = reportsStore.getUsageByResellerReport;
   if (!report || !Array.isArray(report.labels) || !Array.isArray(report.datasets)) {
      if(report) console.warn("Usage by reseller report data is not in expected chart.js format:", report);
      return null;
  }
  // Assuming backend returns data in Chart.js compatible format:
  // { labels: ['ResellerA', 'ResellerB'], datasets: [{ label: 'Usage (GB)', data: [500, 750] }] }
  return report;
});

const usageByResellerChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y', // For horizontal bar chart if desired
  plugins: {
    legend: { display: true },
    title: { display: true, text: `Usage by Reseller - ${selectedPeriod.value.label}` }
  }
}));

</script>

<style scoped>
.admin-reports-view {
  padding: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.loading-state, .error-state {
  margin-top: 20px;
  padding: 20px;
}
</style>
