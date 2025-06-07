<template>
  <el-dialog
    :model-value="isVisible"
    :title="`Manage Panel Access for ${reseller ? reseller.username : ''}`"
    width="50%"
    @close="onClose"
    :close-on-click-modal="false"
  >
    <div v-loading="isLoadingDialog">
      <p v-if="!reseller">Select a reseller to manage panel access.</p>
      <div v-else>
        <el-alert
          v-if="resellersStore.getPanelAccessError"
          :title="resellersStore.getPanelAccessError"
          type="error"
          show-icon
          style="margin-bottom: 15px;"
        />

        <p style="margin-bottom: 10px;">Select the Marzban panels this reseller can access:</p>
        <el-checkbox-group v-model="selectedPanelIds">
          <el-checkbox
            v-for="panel in availablePanels"
            :key="panel.id"
            :label="panel.id"
            border
            style="margin-bottom: 8px; width: 100%;"
          >
            {{ panel.name }} (ID: {{ panel.id }}) - {{ panel.api_url }}
          </el-checkbox>
        </el-checkbox-group>
        <p v-if="!availablePanels || availablePanels.length === 0" style="margin-top:10px;">
            No Marzban panels available. Please add panels in the "Marzban Panels" section first.
        </p>
      </div>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="onClose" :disabled="resellersStore.isPanelAccessLoading">Cancel</el-button>
        <el-button
            type="primary"
            @click="onSave"
            :loading="resellersStore.isPanelAccessLoading"
            :disabled="!reseller || availablePanels.length === 0"
        >
          Save Access
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, computed, defineProps, defineEmits } from 'vue'; // Removed onMounted as unused
import { useAdminResellersStore } from '@/store/adminResellers';
import { ElMessage } from 'element-plus';

const props = defineProps({
  reseller: {
    type: Object,
    default: null,
  },
  isVisible: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['close', 'save']);

const resellersStore = useAdminResellersStore();
const availablePanels = computed(() => resellersStore.getMarzbanPanels);
const selectedPanelIds = ref([]);
const initialLoading = ref(false); // For initial load of both panels and current access

const isLoadingDialog = computed(() =>
    resellersStore.isPanelAccessLoading || initialLoading.value
);


const fetchRequiredData = async () => {
  if (props.reseller && props.isVisible) {
    initialLoading.value = true;
    // Fetch all available Marzban panels for selection
    const fetchPanelsPromise = resellersStore.fetchMarzbanPanelsForSelection();

    // Fetch current panel access for this reseller
    const fetchAccessPromise = resellersStore.fetchResellerPanelAccess(props.reseller.id)
      .then(currentAccess => {
        // Assuming currentAccess is an array of panel objects or just panel IDs
        // If objects: currentAccess.map(p => p.id)
        // If IDs: currentAccess directly (ensure it's an array)
        if (Array.isArray(currentAccess)) {
            selectedPanelIds.value = currentAccess.map(p => p.id); // Adjust if API returns just IDs
        } else {
            selectedPanelIds.value = [];
            console.error("Fetched reseller panel access is not an array:", currentAccess);
        }

      })
      // Corrected to use _err or log it, for now just renaming param
      .catch(_err => {
        console.error("Error in fetchAccessPromise for ResellerPanelAccessDialog:", _err);
        // Error already set in store, but can be handled here too if needed
        selectedPanelIds.value = []; // Reset on error
      });

    try {
        await Promise.all([fetchPanelsPromise, fetchAccessPromise]);
    } catch (error) {
        console.error("Error fetching data for panel access dialog:", error);
        // Error state is managed within the store actions
    } finally {
        initialLoading.value = false;
    }
  }
};

watch(() => props.isVisible, (newVal) => {
  if (newVal) {
    fetchRequiredData();
  } else {
    // Reset when dialog is hidden
    selectedPanelIds.value = [];
    resellersStore.$patch({ panelAccessError: null }); // Clear previous errors
  }
}, { immediate: true });


const onSave = () => {
  if (!props.reseller) {
    ElMessage.error('No reseller selected.');
    return;
  }
  emit('save', { resellerId: props.reseller.id, selectedPanelIds: selectedPanelIds.value });
};

const onClose = () => {
  emit('close');
};

</script>

<style scoped>
.el-checkbox-group {
  display: flex;
  flex-direction: column;
}
.el-checkbox.is-bordered + .el-checkbox.is-bordered {
    margin-left: 0px; /* Override default margin for vertical layout */
}
</style>
