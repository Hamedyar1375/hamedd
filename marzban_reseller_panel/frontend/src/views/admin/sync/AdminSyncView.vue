<template>
  <div class="admin-sync-view">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>Data Synchronization with Marzban Panels</span>
        </div>
      </template>

      <!-- Current Sync Status Display -->
      <el-card shadow="never" style="margin-bottom: 20px;">
        <template #header><h4>Current Sync Status</h4></template>
        <div v-if="syncStore.isLoading && !syncStore.getSyncStatus">Loading status...</div>
        <div v-else-if="syncStore.getError && !syncStore.getSyncStatus">
          <el-alert :title="`Error fetching status: ${syncStore.getError}`" type="error" show-icon />
        </div>
        <div v-else-if="syncStore.getSyncStatus">
          <!-- Example: Displaying status. Adjust based on actual syncStatus object structure -->
          <el-descriptions :column="2" border>
            <el-descriptions-item label="Overall Status">{{ syncStore.getSyncStatus.overall_status || 'N/A' }}</el-descriptions-item>
            <el-descriptions-item label="Last Sync Time">{{ formatDate(syncStore.getSyncStatus.last_sync_time) }}</el-descriptions-item>
            <el-descriptions-item label="Current Task">{{ syncStore.getSyncStatus.current_task_description || 'None' }}</el-descriptions-item>
            <el-descriptions-item label="Details">{{ syncStore.getSyncStatus.details || 'No additional details' }}</el-descriptions-item>
          </el-descriptions>
        </div>
        <el-empty v-else description="No sync status available. Fetch status or run a sync task." />
        <el-button @click="refreshStatus" :loading="syncStore.isLoading" style="margin-top:10px;">Refresh Status</el-button>
      </el-card>

      <!-- Trigger Synchronization Tasks -->
      <el-card shadow="never">
        <template #header><h4>Trigger Sync Tasks</h4></template>
        <el-form :inline="true" @submit.prevent style="margin-bottom: 20px;">
          <el-form-item label="Select Marzban Panel:">
            <el-select
              v-model="selectedPanelId"
              placeholder="Choose a panel"
              filterable
              style="width: 300px;"
              :loading="marzbanPanelsStore.isLoading"
              clearable
            >
              <el-option
                v-for="panel in marzbanPanelsStore.getPanels"
                :key="panel.id"
                :label="`${panel.name} (ID: ${panel.id})`"
                :value="panel.id"
              />
            </el-select>
          </el-form-item>
        </el-form>

        <div v-if="!selectedPanelId">
          <el-alert title="Please select a Marzban Panel to trigger sync tasks." type="info" show-icon :closable="false"/>
        </div>

        <div v-else>
          <el-button
            type="primary"
            @click="handleSyncUsers"
            :loading="syncStore.isTaskLoading(`users_panel_${selectedPanelId}`)"
            :disabled="!selectedPanelId"
            style="margin-right: 10px;"
          >
            Sync Users from Panel
          </el-button>
          <el-button
            type="success"
            @click="handleFullSync"
            :loading="syncStore.isTaskLoading(`all_panel_${selectedPanelId}`)"
            :disabled="!selectedPanelId"
          >
            Full Sync with Panel
          </el-button>
          <div v-if="syncStore.getError && (syncStore.isTaskLoading(`users_panel_${selectedPanelId}`) || syncStore.isTaskLoading(`all_panel_${selectedPanelId}`))" style="margin-top:10px;">
             <el-alert :title="`Error during sync: ${syncStore.getError}`" type="error" show-icon />
          </div>
        </div>
      </el-card>

      <!-- Optional: Sync History Table -->
      <!--
      <el-card shadow="never" style="margin-top: 20px;">
        <template #header><h4>Sync History</h4></template>
        <el-table :data="syncStore.getSyncHistory" v-loading="syncStore.isLoading">
          <el-table-column prop="task_id" label="Task ID" />
          <el-table-column prop="panel_name" label="Panel" />
          <el-table-column prop="task_type" label="Type" />
          <el-table-column prop="status" label="Status" />
          <el-table-column prop="started_at" label="Started" :formatter="row => formatDate(row.started_at)" />
          <el-table-column prop="finished_at" label="Finished" :formatter="row => formatDate(row.finished_at)" />
          <el-table-column prop="details" label="Details" />
        </el-table>
        <el-button @click="fetchHistory" :loading="syncStore.isLoading" style="margin-top:10px;">Refresh History</el-button>
      </el-card>
      -->
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'; // Removed computed as unused
import { useAdminSyncStore } from '@/store/adminSync';
import { useAdminMarzbanPanelsStore } from '@/store/adminMarzbanPanels';
import { ElMessage } from 'element-plus';

const syncStore = useAdminSyncStore();
const marzbanPanelsStore = useAdminMarzbanPanelsStore();

const selectedPanelId = ref(null);

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString();
};

onMounted(async () => {
  syncStore.fetchSyncStatus();
  // Fetch Marzban panels if not already loaded, for the dropdown
  if (marzbanPanelsStore.getPanels.length === 0) {
    marzbanPanelsStore.fetchPanels();
  }
  // syncStore.fetchSyncHistory(); // If history is implemented
});

const refreshStatus = () => {
    syncStore.fetchSyncStatus();
};

// const fetchHistory = () => {
//     syncStore.fetchSyncHistory();
// };

const handleSyncUsers = async () => {
  if (!selectedPanelId.value) {
    ElMessage.warning('Please select a Marzban Panel first.');
    return;
  }
  try {
    const response = await syncStore.triggerUserSync(selectedPanelId.value);
    ElMessage.success(response.message || `User sync started for panel ID ${selectedPanelId.value}.`);
    // Optionally refresh status after a delay or if response indicates completion
    setTimeout(() => syncStore.fetchSyncStatus(), 2000); // Example delay
  } catch (error) {
    ElMessage.error(syncStore.getError || 'Failed to start user sync.');
  }
};

const handleFullSync = async () => {
  if (!selectedPanelId.value) {
    ElMessage.warning('Please select a Marzban Panel first.');
    return;
  }
  try {
    const response = await syncStore.triggerFullSync(selectedPanelId.value);
    ElMessage.success(response.message || `Full sync started for panel ID ${selectedPanelId.value}.`);
    setTimeout(() => syncStore.fetchSyncStatus(), 5000); // Example delay, full sync might take longer
  } catch (error) {
    ElMessage.error(syncStore.getError || 'Failed to start full sync.');
  }
};

</script>

<style scoped>
.admin-sync-view {
  padding: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.el-card {
    margin-bottom: 20px;
}
</style>
