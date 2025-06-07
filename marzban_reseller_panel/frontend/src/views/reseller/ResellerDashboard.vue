<template>
  <div class="reseller-dashboard">
    <!-- Welcome Message -->
    <el-card style="margin-bottom: 20px;">
      <template #header>
        <div class="card-header">
          <span v-if="authStore.getResellerUser">Welcome, {{ authStore.getResellerUser.username }}!</span>
          <span v-else>Reseller Dashboard</span>
        </div>
      </template>
      <p>This is your dashboard to manage your users, services, and finances.</p>
      <p v-if="authStore.getStatus === 'loading' && !authStore.getResellerUser">Loading your details...</p>
      <p v-if="authStore.getStatus === 'failed' && !authStore.getResellerUser">
        Error loading your details: {{ authStore.getError }}
      </p>
    </el-card>

    <!-- Summary KPI Cards -->
    <el-row :gutter="20" style="margin-bottom: 20px;">
      <el-col :xs="24" :sm="12" :md="8" style="margin-bottom: 20px;">
        <el-card shadow="hover" class="kpi-card">
          <div class="kpi-title">Wallet Balance</div>
          <div class="kpi-value">{{ walletBalance }}</div>
          <el-button type="primary" link @click="goTo('/reseller/wallet')" style="margin-top:10px;">View Wallet</el-button>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="8" style="margin-bottom: 20px;">
        <el-card shadow="hover" class="kpi-card">
          <div class="kpi-title">Active Users</div>
          <div class="kpi-value">{{ activeUsersDisplay }}</div>
           <el-button type="primary" link @click="goTo('/reseller/users')" style="margin-top:10px;">Manage Users</el-button>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="8" style="margin-bottom: 20px;">
        <el-card shadow="hover" class="kpi-card">
          <div class="kpi-title">Recent Activity</div>
          <div class="kpi-value">{{ recentActivity }}</div>
          <el-button type="primary" link @click="goTo('/reseller/reports')" style="margin-top:10px;">View Reports</el-button>
        </el-card>
      </el-col>
    </el-row>

    <!-- Quick Links & User Info Section -->
    <el-row :gutter="20">
      <el-col :xs="24" :md="16">
        <el-card>
          <template #header>Quick Actions</template>
          <el-button-group style="margin-bottom:10px;">
            <el-button type="primary" @click="goTo('/reseller/users')"><el-icon><Plus /></el-icon> Add/Manage Users</el-button>
            <el-button type="success" @click="goTo('/reseller/wallet')"><el-icon><Coin /></el-icon> My Wallet</el-button>
          </el-button-group>
          <p>Use the sidebar to navigate to other sections like detailed user management, service plans, and your profile.</p>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="8">
         <el-card>
            <template #header>Your Information</template>
             <div v-if="authStore.getResellerUser">
                <el-descriptions :column="1" border size="small">
                    <el-descriptions-item label="User ID">{{ authStore.getResellerUser.id }}</el-descriptions-item>
                    <el-descriptions-item label="Username">{{ authStore.getResellerUser.username }}</el-descriptions-item>
                    <el-descriptions-item label="Email">{{ authStore.getResellerUser.email }}</el-descriptions-item>
                    <el-descriptions-item label="Full Name">{{ authStore.getResellerUser.full_name || 'N/A' }}</el-descriptions-item>
                    <el-descriptions-item label="Status">
                        <el-tag :type="authStore.getResellerUser.is_active ? 'success' : 'danger'">
                        {{ authStore.getResellerUser.is_active ? 'Active' : 'Inactive' }}
                        </el-tag>
                    </el-descriptions-item>
                </el-descriptions>
                <el-button type="primary" link @click="goTo('/reseller/profile')" style="margin-top:10px;">Edit Profile</el-button>
            </div>
            <el-empty v-else-if="!authStore.isLoading" description="Reseller details not loaded." />
            <div v-if="authStore.isLoading"><el-skeleton :rows="3" animated /></div>
        </el-card>
      </el-col>
    </el-row>

  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'; // Added watch
import { useRouter } from 'vue-router';
import { useResellerAuthStore } from '@/store/resellerAuth';
import { useResellerWalletStore } from '@/store/resellerWallet'; // Import wallet store
import { useResellerUsersStore } from '@/store/resellerUsers'; // Import users store
import { Plus, Coin } from '@element-plus/icons-vue';

const router = useRouter();
const authStore = useResellerAuthStore();
const walletStore = useResellerWalletStore(); // Initialize wallet store
const usersStore = useResellerUsersStore(); // Initialize users store

// KPI data
// const walletBalanceDisplay = computed(() => { // Removed as unused
//     if (walletStore.isLoadingBalance) return 'Loading...';
//     if (walletStore.getBalanceError) return 'Error';
//     if (walletStore.getBalance) {
//         return new Intl.NumberFormat('en-US', {
//             style: 'currency',
//             currency: walletStore.getBalance.currency || 'USD'
//         }).format(walletStore.getBalance.balance);
//     }
//     return 'N/A';
// });
const activeUsersDisplay = computed(() => {
    if (usersStore.loadingUsers && usersStore.getUsers.length === 0 && usersStore.getPagination.totalItems === 0) return 'Loading...';
    if (usersStore.getPagination && usersStore.getPagination.totalItems !== undefined) {
        return usersStore.getPagination.totalItems;
    }
    return usersStore.getUsers.length || 'N/A';
});
const recentActivity = ref('N/A');  // Placeholder, to be fetched from resellerReportsStore or profile

const fetchKpiData = async () => {
  // Wallet balance is now handled by its own store and computed property.
  // Active users count will be derived from usersStore after it fetches users.

  // Fetch users if not already loaded to get a count for the KPI
  // Fetch a minimal set just for the count if users data isn't primary for this dashboard view yet.
  if (usersStore.getUsers.length === 0 && !usersStore.loadingUsers && usersStore.getPagination.totalItems === 0) {
    await usersStore.fetchUsers({ page: 1, pageSize: 1 });
  }

  // Recent activity would also be a separate call or part of a dashboard summary API
  recentActivity.value = 'No new activity'; // Placeholder
};

onMounted(async () => {
  if (authStore.isAuthenticated && !authStore.getResellerUser && authStore.getStatus !== 'loading') {
    await authStore.checkAuth(); // Fetches resellerUser, which might trigger watch
  } else if (authStore.getResellerUser) { // If user data already in store
    fetchKpiData(); // Fetch other KPI data
  }

  // Fetch wallet balance regardless of resellerUser, as it's a separate concern
  if (!walletStore.getBalance && !walletStore.isLoadingBalance) {
    await walletStore.fetchWalletBalance();
  }
});

// Watch for resellerUser to be populated by checkAuth
watch(() => authStore.getResellerUser, (newUser) => {
    if(newUser) {
        fetchKpiData(); // Fetch other KPIs that might depend on resellerUser
    }
}, { immediate: false }); // immediate might be true if fetchKpiData doesn't rely on async checkAuth completion

// Watch for wallet balance changes from the store
watch(() => walletStore.getBalance, () => { // _newBalance removed as unused
    // walletBalanceDisplay computed property will update automatically
    // No specific action needed here unless there's other logic.
}, { deep: true });

const goTo = (path) => {
  router.push(path);
};

</script>

<style scoped>
.reseller-dashboard {
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
</style>
