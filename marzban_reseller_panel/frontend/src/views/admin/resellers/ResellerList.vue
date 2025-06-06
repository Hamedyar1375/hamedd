<template>
  <div class="reseller-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>Manage Resellers</span>
          <el-button type="primary" @click="handleAddReseller">
            <el-icon><Plus /></el-icon> Add Reseller
          </el-button>
        </div>
      </template>

      <el-table :data="resellersStore.getResellers" v-loading="resellersStore.isLoading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" sortable />
        <el-table-column prop="username" label="Username" sortable />
        <el-table-column prop="email" label="Email" sortable />
        <el-table-column prop="full_name" label="Full Name" sortable />
        <el-table-column prop="is_active" label="Status" width="100" sortable>
          <template #default="scope">
            <el-tag :type="scope.row.is_active ? 'success' : 'danger'">
              {{ scope.row.is_active ? 'Active' : 'Inactive' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="marzban_panel_id" label="Default Panel ID" width="150" />
        <!-- wallet_balance might not be directly on reseller object, adjust as per actual API response -->
        <!-- <el-table-column prop="wallet_balance" label="Wallet Balance" width="150" sortable /> -->

        <el-table-column label="Actions" width="280">
          <template #default="scope">
            <el-button size="small" @click="handleEditReseller(scope.row)">
              <el-icon><Edit /></el-icon> Edit
            </el-button>
            <el-button size="small" type="info" @click="handleManagePanels(scope.row)">
              <el-icon><Platform /></el-icon> Panels
            </el-button>
            <el-popconfirm
              title="Are you sure to delete this reseller?"
              confirm-button-text="Yes, Delete"
              @confirm="handleDeleteReseller(scope.row.id)"
            >
              <template #reference>
                <el-button size="small" type="danger">
                  <el-icon><Delete /></el-icon> Delete
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="resellersStore.getError" class="error-message">
        <el-alert :title="resellersStore.getError" type="error" show-icon />
      </div>
    </el-card>

    <!-- Dialog for Add/Edit Reseller -->
    <el-dialog
      v-model="resellerDialogVisible"
      :title="isEditModeReseller ? 'Edit Reseller' : 'Add New Reseller'"
      width="60%"
      @closed="handleResellerDialogClosed"
    >
      <ResellerForm
        v-if="resellerDialogVisible"
        :reseller="currentReseller"
        :is-edit-mode="isEditModeReseller"
        @submit="handleResellerFormSubmit"
        @cancel="resellerDialogVisible = false"
      />
    </el-dialog>

    <!-- Dialog for Manage Panel Access -->
    <ResellerPanelAccessDialog
        v-if="panelAccessDialogVisible"
        :reseller="currentResellerForPanels"
        :is-visible="panelAccessDialogVisible"
        @close="panelAccessDialogVisible = false"
        @save="handlePanelAccessSave"
    />

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAdminResellersStore } from '@/store/adminResellers';
import ResellerForm from '@/components/admin/resellers/ResellerForm.vue'; // To be created
import ResellerPanelAccessDialog from '@/components/admin/resellers/ResellerPanelAccessDialog.vue'; // To be created
import { ElMessage } from 'element-plus';
import { Plus, Edit, Delete, Platform } from '@element-plus/icons-vue';

const resellersStore = useAdminResellersStore();

// Reseller Add/Edit Dialog
const resellerDialogVisible = ref(false);
const isEditModeReseller = ref(false);
const currentReseller = ref(null);

// Panel Access Dialog
const panelAccessDialogVisible = ref(false);
const currentResellerForPanels = ref(null);


onMounted(() => {
  resellersStore.fetchResellers();
});

const handleAddReseller = () => {
  isEditModeReseller.value = false;
  currentReseller.value = null;
  resellerDialogVisible.value = true;
};

const handleEditReseller = (reseller) => {
  isEditModeReseller.value = true;
  currentReseller.value = { ...reseller };
  resellerDialogVisible.value = true;
};

const handleDeleteReseller = async (resellerId) => {
  try {
    await resellersStore.deleteReseller(resellerId);
    ElMessage.success('Reseller deleted successfully.');
  } catch (error) {
    ElMessage.error(resellersStore.getError || 'Failed to delete reseller.');
  }
};

const handleResellerFormSubmit = async (resellerData) => {
  try {
    if (isEditModeReseller.value && currentReseller.value) {
      await resellersStore.updateReseller(currentReseller.value.id, resellerData);
      ElMessage.success('Reseller updated successfully.');
    } else {
      await resellersStore.addReseller(resellerData);
      ElMessage.success('Reseller added successfully.');
    }
    resellerDialogVisible.value = false;
  } catch (error) {
    ElMessage.error(resellersStore.getError || 'Operation failed.');
  }
};

const handleResellerDialogClosed = () => {
  currentReseller.value = null;
};

// Panel Access Management
const handleManagePanels = (reseller) => {
  currentResellerForPanels.value = reseller;
  panelAccessDialogVisible.value = true;
};

const handlePanelAccessSave = async ({ resellerId, selectedPanelIds }) => {
    try {
        await resellersStore.updateResellerPanelAccess(resellerId, selectedPanelIds);
        ElMessage.success('Panel access updated successfully.');
        panelAccessDialogVisible.value = false;
    } catch (error) {
        ElMessage.error(resellersStore.getPanelAccessError || 'Failed to update panel access.');
    }
};

</script>

<style scoped>
.reseller-list {
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
