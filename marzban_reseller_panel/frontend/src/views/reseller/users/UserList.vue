<template>
  <div class="user-list-view">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>Manage Your Marzban Users</span>
          <el-button type="primary" @click="handleAddUser">
            <el-icon><Plus /></el-icon> Add User
          </el-button>
        </div>
      </template>

      <!-- Filters -->
      <el-form :inline="true" :model="filters" @submit.prevent="handleSearch" style="margin-bottom: 20px;">
        <el-form-item label="Username">
          <el-input v-model="filters.username" placeholder="Search username" clearable />
        </el-form-item>
        <el-form-item label="Status">
          <el-select v-model="filters.status" placeholder="Any status" clearable>
            <el-option label="Active" value="active" />
            <el-option label="Disabled" value="disabled" />
            <el-option label="Expired" value="expired" />
            <!-- Add other statuses from Marzban if applicable -->
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">Search</el-button>
          <el-button @click="resetFilters">Reset</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="usersStore.getUsers" v-loading="usersStore.loadingUsers" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" sortable />
        <el-table-column prop="username" label="Username" sortable />
        <el-table-column prop="status" label="Status" width="120" sortable>
          <template #default="scope">
            <el-tag :type="statusTagType(scope.row.status)">{{ scope.row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Usage" width="180">
          <template #default="scope">
            {{ formatBytes(scope.row.used_traffic) }} /
            {{ scope.row.data_limit ? formatBytes(scope.row.data_limit) : 'Unlimited' }}
          </template>
        </el-table-column>
        <el-table-column label="Expiry Date" width="180" sortable>
            <template #default="scope">
                {{ scope.row.expire ? formatDate(scope.row.expire * 1000) : 'N/A' }}
            </template>
        </el-table-column>
         <el-table-column label="Panel ID" prop="marzban_panel_id" width="100" sortable />
        <el-table-column label="Subscription" width="150">
            <template #default="scope">
                <el-button link type="primary" @click="showSubscription(scope.row)">View</el-button>
            </template>
        </el-table-column>

        <el-table-column label="Actions" width="280" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="handleEditUser(scope.row)">
              <el-icon><Edit /></el-icon> Edit
            </el-button>
            <el-button size="small" type="info" @click="handleViewUsage(scope.row)">
              <el-icon><DataLine /></el-icon> Usage
            </el-button>
             <el-popconfirm
              title="Delete this user? This action might be irreversible."
              confirm-button-text="Yes, Delete"
              @confirm="handleDeleteUser(scope.row.id)"
            >
              <template #reference>
                <el-button size="small" type="danger" :loading="usersStore.deletingUser && currentActionUserId === scope.row.id">
                  <el-icon><Delete /></el-icon> Delete
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-if="usersStore.getPagination.totalItems > 0"
        layout="total, sizes, prev, pager, next, jumper"
        :total="usersStore.getPagination.totalItems"
        :page-sizes="[10, 20, 50, 100]"
        :current-page="usersStore.getPagination.currentPage"
        :page-size="usersStore.getPagination.pageSize"
        @size-change="handleSizeChange"
        @current-change="handleCurrentPageChange"
        style="margin-top: 20px; text-align: right;"
      />

      <div v-if="usersStore.errorUsers" class="error-message">
        <el-alert :title="usersStore.errorUsers" type="error" show-icon />
      </div>
    </el-card>

    <!-- Add/Edit User Dialog -->
    <el-dialog
      v-model="userDialogVisible"
      :title="isEditMode ? 'Edit Marzban User' : 'Add New Marzban User'"
      width="60%"
      @closed="handleUserDialogClosed"
    >
      <UserForm
        v-if="userDialogVisible"
        :user="currentUser"
        :is-edit-mode="isEditMode"
        :available-panels="resellerAccessiblePanels"
        :available-plans="resellerPricingPlans"
        @submit="handleUserFormSubmit"
        @cancel="userDialogVisible = false"
      />
    </el-dialog>

    <!-- User Usage Dialog -->
    <el-dialog v-model="usageDialogVisible" title="User Usage Details" width="50%">
        <div v-if="usersStore.loadingUsage"><el-skeleton :rows="3" animated /></div>
        <div v-else-if="usersStore.errorUsage"><el-alert :title="usersStore.errorUsage" type="error" /></div>
        <div v-else-if="usersStore.getUserUsage">
            <el-descriptions :column="2" border>
                <el-descriptions-item label="Username">{{ selectedUserForUsage?.username }}</el-descriptions-item>
                <el-descriptions-item label="Data Limit">{{ usersStore.getUserUsage.data_limit ? formatBytes(usersStore.getUserUsage.data_limit) : 'Unlimited' }}</el-descriptions-item>
                <el-descriptions-item label="Data Used">{{ formatBytes(usersStore.getUserUsage.used_traffic) }}</el-descriptions-item>
                <el-descriptions-item label="Data Remaining">{{ usersStore.getUserUsage.data_limit ? formatBytes(usersStore.getUserUsage.data_limit - usersStore.getUserUsage.used_traffic) : 'Unlimited' }}</el-descriptions-item>
                <el-descriptions-item label="Download">{{ formatBytes(usersStore.getUserUsage.download) }}</el-descriptions-item>
                <el-descriptions-item label="Upload">{{ formatBytes(usersStore.getUserUsage.upload) }}</el-descriptions-item>
                <el-descriptions-item label="Expiry Date">{{ usersStore.getUserUsage.expire ? formatDate(usersStore.getUserUsage.expire * 1000) : 'N/A' }}</el-descriptions-item>
                <el-descriptions-item label="Status">{{ usersStore.getUserUsage.status }}</el-descriptions-item>
            </el-descriptions>
        </div>
        <el-empty v-else description="No usage data available." />
    </el-dialog>

    <!-- Subscription Link Dialog -->
    <el-dialog v-model="subscriptionDialogVisible" title="Subscription Link" width="50%">
        <div v-if="currentSubscriptionLink">
            <p><strong>Subscription URL:</strong></p>
            <el-input :model-value="currentSubscriptionLink" readonly autosize type="textarea">
                <template #append>
                    <el-button @click="copyToClipboard(currentSubscriptionLink)">Copy</el-button>
                </template>
            </el-input>
            <p style="margin-top:10px;"><strong>QR Code:</strong> (Placeholder - install qrcode.vue or similar)</p>
            <!-- <qrcode-vue :value="currentSubscriptionLink" :size="200" level="H" v-if="currentSubscriptionLink" /> -->
            <div style="width:200px; height:200px; border:1px solid #ccc; display:flex; align-items:center; justify-content:center;">QR Code Area</div>

        </div>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed, defineAsyncComponent } from 'vue';
import { useResellerUsersStore } from '@/store/resellerUsers';
import { useResellerAuthStore } from '@/store/resellerAuth'; // To get accessible panels
import { useAdminPricingPlansStore } from '@/store/adminPricingPlans'; // To get global plans
import { useAdminResellerPricingsStore } from '@/store/adminResellerPricings'; // To get reseller specific pricing
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Edit, Delete, DataLine } from '@element-plus/icons-vue';
// import QrcodeVue from 'qrcode.vue'; // Uncomment if installed

const UserForm = defineAsyncComponent(() =>
    import('@/components/reseller/users/UserForm.vue') // To be created
);

const usersStore = useResellerUsersStore();
const authStore = useResellerAuthStore(); // Reseller's own auth store
const globalPlansStore = useAdminPricingPlansStore(); // Fetched by admin, reseller might need to fetch too or get from admin
const resellerPricingsStore = useAdminResellerPricingsStore(); // Fetched by admin

const filters = reactive({ username: '', status: '' });
const currentActionUserId = ref(null); // For loading state on delete button

// User Add/Edit Dialog
const userDialogVisible = ref(false);
const isEditMode = ref(false);
const currentUser = ref(null);

// User Usage Dialog
const usageDialogVisible = ref(false);
const selectedUserForUsage = ref(null);

// Subscription Link Dialog
const subscriptionDialogVisible = ref(false);
const currentSubscriptionLink = ref('');

// Data for UserForm selections
const resellerAccessiblePanels = ref([]); // To be populated based on reseller's assigned panels
const resellerPricingPlans = ref([]); // Global plans merged with reseller-specific pricing

const statusTagType = (status) => {
  // active, disabled, expired, limited
  if (status === 'active') return 'success';
  if (status === 'disabled') return 'danger';
  if (status === 'expired') return 'warning';
  if (status === 'limited') return 'info';
  return '';
};

const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  if (!bytes) return 'N/A';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
};

const loadInitialData = (page = 1, pageSize = usersStore.getPagination.pageSize) => {
  usersStore.fetchUsers({ ...filters, page, pageSize });
};

onMounted(async () => {
  loadInitialData();
  // Populate data for UserForm selections
  // 1. Reseller's accessible Marzban Panels
  if (authStore.getResellerUser && authStore.getResellerUser.accessible_panels) {
      // Assuming 'accessible_panels' is part of the ResellerUser object from backend
      // This might be a list of panel objects {id, name, api_url, ...}
      // Or it might be fetched from a dedicated endpoint if not on resellerUser.
      // For now, assume it's on resellerUser.
      resellerAccessiblePanels.value = authStore.getResellerUser.accessible_panels;
      // If not on resellerUser, fetch it:
      // await someService.getResellerAccessiblePanels(); and store it.
  } else if (authStore.getResellerUser) {
      // If resellerUser exists but no accessible_panels, try to fetch them (if API exists)
      // This is a placeholder, actual logic depends on how reseller panel access is structured.
      // For now, if not on user object, it might be populated from admin-assigned panels.
      // This part might need a dedicated store or service call for the reseller to know their panels.
      console.warn("Reseller accessible panels not found on user object. UserForm panel selection might be empty.");
      // Example: if reseller has a default panel_id or list of panel_ids
      // resellerAccessiblePanels.value = [{id: authStore.getResellerUser.default_panel_id, name: 'Default Panel'}]
  }


  // 2. Available pricing plans for the reseller (global plans + reseller-specific pricing)
  await globalPlansStore.fetchPlans(); // Ensure global plans are loaded
  if (authStore.getResellerUser) {
    await resellerPricingsStore.fetchPricingsForReseller(authStore.getResellerUser.id);

    const overridesMap = new Map(
        resellerPricingsStore.getPricingsForCurrentReseller.map(p => [p.pricing_plan_id, p.custom_price])
    );

    resellerPricingPlans.value = globalPlansStore.getPlans.map(plan => ({
        ...plan,
        reseller_price: overridesMap.has(plan.id) ? overridesMap.get(plan.id) : plan.price, // Use override or default
        is_override: overridesMap.has(plan.id)
    }));
  } else {
      resellerPricingPlans.value = globalPlansStore.getPlans.map(plan => ({ ...plan, reseller_price: plan.price, is_override: false }));
  }

});

const handleSearch = () => {
  loadInitialData(1, usersStore.getPagination.pageSize); // Reset to first page on new search
};

const resetFilters = () => {
  filters.username = '';
  filters.status = '';
  handleSearch();
};

const handleSizeChange = (newSize) => {
  loadInitialData(1, newSize); // Reset to first page on size change
};

const handleCurrentPageChange = (newPage) => {
  loadInitialData(newPage, usersStore.getPagination.pageSize);
};

const handleAddUser = () => {
  isEditMode.value = false;
  currentUser.value = null;
  userDialogVisible.value = true;
};

const handleEditUser = (user) => {
  isEditMode.value = true;
  currentUser.value = { ...user };
  userDialogVisible.value = true;
};

const handleDeleteUser = async (userId) => {
  currentActionUserId.value = userId;
  try {
    await usersStore.deleteUser(userId);
    ElMessage.success('User deleted successfully.');
  } catch (error) {
    ElMessage.error(usersStore.errorDelete || 'Failed to delete user.');
  } finally {
    currentActionUserId.value = null;
  }
};

const handleUserFormSubmit = async (userData) => {
  try {
    if (isEditMode.value && currentUser.value) {
      await usersStore.updateUser(currentUser.value.id, userData);
      ElMessage.success('User updated successfully.');
    } else {
      await usersStore.createUser(userData);
      ElMessage.success('User created successfully.');
    }
    userDialogVisible.value = false;
  } catch (error) {
     // Error is already set in store, form can display it or use ElMessage
    ElMessage.error(usersStore.errorSubmit || 'Operation failed.');
  }
};

const handleUserDialogClosed = () => {
  currentUser.value = null;
};

const handleViewUsage = async (user) => {
    selectedUserForUsage.value = user;
    usageDialogVisible.value = true;
    await usersStore.fetchUserUsage(user.id);
};

const showSubscription = (user) => {
    // Assuming subscription_url is a field on the user object from Marzban
    if (user.subscription_url) {
        currentSubscriptionLink.value = user.subscription_url;
        subscriptionDialogVisible.value = true;
    } else {
        ElMessage.info('No subscription link available for this user.');
    }
};

const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        ElMessage.success('Copied to clipboard!');
    } catch (err) {
        ElMessage.error('Failed to copy.');
    }
};

</script>

<style scoped>
.user-list-view {
  padding: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.error-message {
  margin-top: 15px;
}
</style>
