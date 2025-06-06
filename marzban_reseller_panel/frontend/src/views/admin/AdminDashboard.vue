<template>
  <div class="admin-dashboard">
    <!-- Welcome Message -->
    <el-card style="margin-bottom: 20px;">
      <template #header>
        <div class="card-header">
          <span>Welcome, {{ authStore.getAdminUser ? authStore.getAdminUser.username : 'Admin' }}!</span>
        </div>
      </template>
      <p>This is your central hub for managing the Marzban Reseller Panel.</p>
      <p v-if="authStore.isLoading">Loading your details...</p>
      <p v-else-if="authStore.getError">Error loading your details: {{ authStore.getError }}</p>
    </el-card>

    <!-- Summary KPI Cards -->
    <el-row :gutter="20" style="margin-bottom: 20px;">
      <el-col :span="6">
        <el-card shadow="hover" class="kpi-card">
          <div class="kpi-title">Total Resellers</div>
          <div class="kpi-value">{{ totalResellers }}</div>
          <!-- <div class="kpi-footer">Updated: Just now</div> -->
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="kpi-card">
          <div class="kpi-title">Active Marzban Panels</div>
          <div class="kpi-value">{{ activePanels }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="kpi-card">
          <div class="kpi-title">Pending Receipts</div>
          <div class="kpi-value">{{ pendingReceipts }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="kpi-card">
          <div class="kpi-title">Sales (Last 30 Days)</div>
          <div class="kpi-value">{{ salesLast30Days }}</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Charts Section -->
    <el-row :gutter="20">
      <el-col :span="16">
        <el-card>
          <template #header>Sales Overview (Last 30 Days)</template>
          <div v-if="reportsStore.isLoadingSalesReport" class="loading-state" style="height: 300px; display:flex; align-items:center; justify-content:center;">
            <el-skeleton :rows="5" animated />
          </div>
          <div v-else-if="reportsStore.getSalesReportError" class="error-state">
            <el-alert :title="reportsStore.getSalesReportError" type="error" show-icon />
          </div>
          <LineChart v-else-if="salesChartData" :chart-data="salesChartData" :chart-options="salesChartOptions" style="height: 300px;" />
          <el-empty v-else description="Sales data not available or format error." style="height: 300px;" />
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <template #header>Quick Links</template>
          <el-button type="primary" plain @click="goTo('/admin/resellers')" style="margin-bottom:10px; width:100%;">Manage Resellers</el-button>
          <el-button type="primary" plain @click="goTo('/admin/marzban-panels')" style="margin-bottom:10px; width:100%;">Manage Marzban Panels</el-button>
          <el-button type="primary" plain @click="goTo('/admin/pricing-plans')" style="margin-bottom:10px; width:100%;">Manage Pricing Plans</el-button>
          <el-button type="primary" plain @click="goTo('/admin/reports')" style="margin-bottom:10px; width:100%;">View Detailed Reports</el-button>
        </el-card>
         <el-card style="margin-top:20px;">
            <template #header>Your Information</template>
             <div v-if="authStore.getAdminUser">
                <el-descriptions :column="1" border size="small">
                    <el-descriptions-item label="User ID">{{ authStore.getAdminUser.id }}</el-descriptions-item>
                    <el-descriptions-item label="Username">{{ authStore.getAdminUser.username }}</el-descriptions-item>
                    <el-descriptions-item label="Active">
                        <el-tag :type="authStore.getAdminUser.is_active ? 'success' : 'danger'">
                        {{ authStore.getAdminUser.is_active ? 'Yes' : 'No' }}
                        </el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="Superuser">
                        <el-tag :type="authStore.getAdminUser.is_superuser ? 'success' : 'danger'">
                        {{ authStore.getAdminUser.is_superuser ? 'Yes' : 'No' }}
                        </el-tag>
                    </el-descriptions-item>
                </el-descriptions>
            </div>
            <el-empty v-else description="Admin details not loaded." />
        </el-card>
      </el-col>
    </el-row>

  </div>
</template>

<script setup>
import { ref, onMounted, computed, defineAsyncComponent } from 'vue';
import { useRouter } from 'vue-router';
import { useAdminAuthStore } from '@/store/adminAuth';
import { useAdminReportsStore } from '@/store/adminReports';
import { useAdminResellersStore } from '@/store/adminResellers'; // For KPI
import { useAdminMarzbanPanelsStore } from '@/store/adminMarzbanPanels'; // For KPI
import { useAdminPaymentReceiptsStore } from '@/store/adminPaymentReceipts'; // For KPI


const LineChart = defineAsyncComponent(() => import('@/components/charts/LineChart.vue'));

const router = useRouter();
const authStore = useAdminAuthStore();
const reportsStore = useAdminReportsStore();

// KPI Data - these would ideally come from specific store getters or API calls
// For now, using store data where available, otherwise placeholders
const resellersStore = useAdminResellersStore();
const marzbanPanelsStore = useAdminMarzbanPanelsStore();
const paymentReceiptsStore = useAdminPaymentReceiptsStore();

const totalResellers = ref(0); // Placeholder, or fetch from resellersStore.getResellers.length
const activePanels = ref(0);   // Placeholder, or fetch from marzbanPanelsStore.getPanels.length
const pendingReceipts = ref(0); // Placeholder
const salesLast30Days = ref('$0.00'); // Placeholder

const fetchKpiData = async () => {
    // Fetch minimal data for KPIs if not already loaded by other views
    if (!resellersStore.getResellers.length) await resellersStore.fetchResellers(0,1); // minimal fetch
    totalResellers.value = resellersStore.getResellers.length; // Example: count of all resellers

    if (!marzbanPanelsStore.getPanels.length) await marzbanPanelsStore.fetchPanels();
    activePanels.value = marzbanPanelsStore.getPanels.filter(p => p.is_active !== false).length; // Example

    // For pending receipts, we might need to fetch only pending status with a limit of 1 to get a count if available,
    // or the backend provides a summary endpoint. For now, this is a placeholder.
    // await paymentReceiptsStore.fetchReceipts('pending');
    // pendingReceipts.value = paymentReceiptsStore.getReceipts.length; // This would fetch all pending receipts

    // For sales, we are already fetching last30days for the chart.
    // We could extract a total from that data.
    const salesData = reportsStore.getSalesReport;
    if (salesData && salesData.datasets && salesData.datasets[0]) {
        const total = salesData.datasets[0].data.reduce((sum, val) => sum + val, 0);
        salesLast30Days.value = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(total);
    } else {
        salesLast30Days.value = 'N/A';
    }
};


onMounted(async () => {
  if (authStore.isAuthenticated && !authStore.getAdminUser && authStore.getStatus !== 'loading') {
    await authStore.checkAuth();
  }
  // Fetch sales report for the dashboard chart
  await reportsStore.fetchSalesReport('last30days');
  fetchKpiData(); // Fetch KPI data after main reports might have run
});

watch(() => reportsStore.getSalesReport, (newReport) => {
    if (newReport && newReport.datasets && newReport.datasets[0]) {
        const total = newReport.datasets[0].data.reduce((sum, val) => sum + val, 0);
        salesLast30Days.value = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(total);
    } else {
        salesLast30Days.value = 'N/A';
    }
}, { deep: true });


const salesChartData = computed(() => {
  const report = reportsStore.getSalesReport;
  if (!report || !Array.isArray(report.labels) || !Array.isArray(report.datasets)) {
      return null;
  }
  return report;
});

const salesChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: true, position: 'top' },
    title: { display: false } // Title is in card header
  },
  scales: { y: { beginAtZero: true } }
}));

const goTo = (path) => {
  router.push(path);
};

</script>

<style scoped>
.admin-dashboard {
  padding: 20px;
}
.card-header span {
  font-size: 1.2em;
  font-weight: bold;
}
.kpi-card {
  text-align: center;
}
.kpi-title {
  font-size: 0.9em;
  color: #606266;
  margin-bottom: 8px;
}
.kpi-value {
  font-size: 1.8em;
  font-weight: bold;
}
.kpi-footer {
  font-size: 0.8em;
  color: #909399;
  margin-top: 8px;
}
.loading-state, .error-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px; /* Match chart height */
}
</style>
