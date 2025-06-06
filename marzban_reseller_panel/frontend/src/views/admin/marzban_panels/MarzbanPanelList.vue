<template>
  <div class="marzban-panel-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>Marzban Panel Configurations</span>
          <el-button type="primary" @click="handleAddPanel">
            <el-icon><Plus /></el-icon> Add Panel
          </el-button>
        </div>
      </template>

      <el-table :data="panelsStore.getPanels" v-loading="panelsStore.isLoading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="Name" sortable />
        <el-table-column prop="api_url" label="API URL" />
        <el-table-column prop="marzban_admin_username" label="Marzban Username" />
        <!-- Add more columns as needed, e.g., status, notes -->
        <el-table-column label="Actions" width="180">
          <template #default="scope">
            <el-button size="small" @click="handleEditPanel(scope.row)">
              <el-icon><Edit /></el-icon> Edit
            </el-button>
            <el-popconfirm
              title="Are you sure you want to delete this panel?"
              confirm-button-text="Yes, Delete"
              cancel-button-text="Cancel"
              @confirm="handleDeletePanel(scope.row.id)"
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

      <div v-if="panelsStore.getError" class="error-message">
        <el-alert :title="panelsStore.getError" type="error" show-icon />
      </div>
    </el-card>

    <!-- Dialog for Add/Edit Panel -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEditMode ? 'Edit Panel' : 'Add New Panel'"
      width="50%"
      @closed="handleDialogClosed"
    >
      <MarzbanPanelForm
        v-if="dialogVisible"
        :panel="currentPanel"
        :is-edit-mode="isEditMode"
        @submit="handleFormSubmit"
        @cancel="dialogVisible = false"
      />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAdminMarzbanPanelsStore } from '@/store/adminMarzbanPanels';
import MarzbanPanelForm from '@/components/admin/marzban_panels/MarzbanPanelForm.vue'; // To be created
import { ElMessage } from 'element-plus';
import { Plus, Edit, Delete } from '@element-plus/icons-vue';

const panelsStore = useAdminMarzbanPanelsStore();

const dialogVisible = ref(false);
const isEditMode = ref(false);
const currentPanel = ref(null);

onMounted(() => {
  panelsStore.fetchPanels();
});

const handleAddPanel = () => {
  isEditMode.value = false;
  currentPanel.value = null; // For a new panel, pass null or an empty object structure
  dialogVisible.value = true;
};

const handleEditPanel = (panel) => {
  isEditMode.value = true;
  currentPanel.value = { ...panel }; // Pass a copy to avoid direct state mutation if form edits directly
  dialogVisible.value = true;
};

const handleDeletePanel = async (panelId) => {
  try {
    await panelsStore.deletePanel(panelId);
    ElMessage.success('Panel deleted successfully.');
  } catch (error) {
    ElMessage.error(panelsStore.getError || 'Failed to delete panel.');
  }
};

const handleFormSubmit = async (panelData) => {
  try {
    if (isEditMode.value && currentPanel.value) {
      await panelsStore.updatePanel(currentPanel.value.id, panelData);
      ElMessage.success('Panel updated successfully.');
    } else {
      await panelsStore.addPanel(panelData);
      ElMessage.success('Panel added successfully.');
    }
    dialogVisible.value = false;
  } catch (error) {
    // Error is already set in store, form can display it or use ElMessage
    ElMessage.error(panelsStore.getError || 'Operation failed.');
  }
};

const handleDialogClosed = () => {
  currentPanel.value = null; // Reset current panel when dialog is closed
  // Optionally, clear form errors if the form component doesn't handle it internally
};

</script>

<style scoped>
.marzban-panel-list {
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
