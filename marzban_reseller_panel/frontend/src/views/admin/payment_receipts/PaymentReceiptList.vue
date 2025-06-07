<template>
  <div class="payment-receipt-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>Manage Payment Receipts</span>
        </div>
      </template>

      <el-tabs v-model="activeTab" @tab-click="handleTabClick">
        <el-tab-pane label="Pending" name="pending">
          <ReceiptTable :receipts="receiptsStore.getReceipts" :loading="receiptsStore.isLoading" status-filter="pending" @approve="approve" @reject="promptReject" />
        </el-tab-pane>
        <el-tab-pane label="Approved" name="approved">
          <ReceiptTable :receipts="receiptsStore.getReceipts" :loading="receiptsStore.isLoading" status-filter="approved" />
        </el-tab-pane>
        <el-tab-pane label="Rejected" name="rejected">
          <ReceiptTable :receipts="receiptsStore.getReceipts" :loading="receiptsStore.isLoading" status-filter="rejected" />
        </el-tab-pane>
      </el-tabs>

      <div v-if="receiptsStore.getError && !receiptsStore.isLoading" class="error-message">
        <el-alert :title="receiptsStore.getError" type="error" show-icon />
      </div>
    </el-card>

    <!-- Rejection Reason Dialog -->
    <el-dialog v-model="rejectionDialogVisible" title="Reject Payment Receipt" width="30%">
      <el-form ref="rejectionFormRef" :model="rejectionForm" :rules="rejectionRules" label-position="top">
        <el-form-item label="Rejection Reason" prop="reason">
          <el-input
            v-model="rejectionForm.reason"
            type="textarea"
            :rows="3"
            placeholder="Please provide a reason for rejection"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rejectionDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="confirmReject" :loading="receiptsStore.isLoading">
          Confirm Rejection
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, reactive } from 'vue';
import { useAdminPaymentReceiptsStore } from '@/store/adminPaymentReceipts';
import { ElMessage, ElMessageBox } from 'element-plus';
// ReceiptTable component will be defined below or in a separate file
// For simplicity here, its props are: receipts, loading, statusFilter, @approve, @reject

// Define ReceiptTable directly or import if it were a separate component
const ReceiptTable = {
  props: ['receipts', 'loading', 'statusFilter', 'hideActions'],
  emits: ['approve', 'reject'],
  setup(props, { emit }) {
    const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleString() : 'N/A';

    const handleApprove = (receiptId) => emit('approve', receiptId);
    const handleReject = (receipt) => emit('reject', receipt); // Pass the whole receipt for ID and context

    return { formatCurrency, formatDate, handleApprove, handleReject };
  },
  template: `
    <el-table :data="receipts" v-loading="loading" style="width: 100%">
      <el-table-column prop="id" label="ID" width="80" sortable />
      <el-table-column prop="reseller.username" label="Reseller" width="150" sortable>
        <template #default="scope">{{ scope.row.reseller ? scope.row.reseller.username : 'N/A' }} (ID: {{ scope.row.reseller_id }})</template>
      </el-table-column>
      <el-table-column prop="amount" label="Amount" width="120" sortable>
        <template #default="scope">{{ formatCurrency(scope.row.amount) }}</template>
      </el-table-column>
      <el-table-column prop="proof_details" label="Proof/Details" show-overflow-tooltip />
      <el-table-column prop="created_at" label="Submitted Date" width="180" sortable>
          <template #default="scope">{{ formatDate(scope.row.created_at) }}</template>
      </el-table-column>
      <el-table-column prop="status" label="Status" width="120" sortable>
        <template #default="scope">
          <el-tag
            :type="scope.row.status === 'pending' ? 'warning' : scope.row.status === 'approved' ? 'success' : 'danger'"
          >{{ scope.row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="rejection_reason" label="Rejection Reason" show-overflow-tooltip v-if="statusFilter === 'rejected'" />
      <el-table-column label="Actions" width="200" v-if="statusFilter === 'pending'">
        <template #default="scope">
          <el-button size="small" type="success" @click="handleApprove(scope.row.id)">Approve</el-button>
          <el-button size="small" type="danger" @click="handleReject(scope.row)">Reject</el-button>
        </template>
      </el-table-column>
    </el-table>
  `
};


const receiptsStore = useAdminPaymentReceiptsStore();
const activeTab = ref('pending');

const rejectionDialogVisible = ref(false);
const currentReceiptToReject = ref(null);
const rejectionFormRef = ref(null);
const rejectionForm = reactive({
  reason: '',
});
const rejectionRules = reactive({
  reason: [{ required: true, message: 'Rejection reason is required', trigger: 'blur' }],
});

const fetchCurrentTabData = () => {
  receiptsStore.fetchReceipts(activeTab.value);
};

onMounted(() => {
  fetchCurrentTabData();
});

watch(activeTab, () => {
  fetchCurrentTabData();
});

const handleTabClick = () => { // _tab removed as unused
  // activeTab is already updated by v-model, watcher will trigger data fetch
};

const approve = async (receiptId) => {
  try {
    await ElMessageBox.confirm(
        'Are you sure you want to approve this payment receipt? This action cannot be undone easily.',
        'Confirm Approval',
        {
            confirmButtonText: 'Yes, Approve',
            cancelButtonText: 'Cancel',
            type: 'success',
        }
    );
    await receiptsStore.approveReceipt(receiptId, activeTab.value);
    ElMessage.success('Receipt approved successfully.');
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') { // Ignore ElMessageBox cancel/close
        ElMessage.error(receiptsStore.getError || 'Failed to approve receipt.');
    }
  }
};

const promptReject = (receipt) => {
  currentReceiptToReject.value = receipt;
  rejectionForm.reason = ''; // Reset reason
  rejectionDialogVisible.value = true;
  // Ensure form validation state is also reset if dialog is reused
  if(rejectionFormRef.value) {
      rejectionFormRef.value.resetFields();
  }
};

const confirmReject = async () => {
  if (!rejectionFormRef.value) return;
  await rejectionFormRef.value.validate(async (valid) => {
    if (valid) {
      if (!currentReceiptToReject.value) return;
      try {
        await receiptsStore.rejectReceipt(currentReceiptToReject.value.id, rejectionForm.reason, activeTab.value);
        ElMessage.success('Receipt rejected successfully.');
        rejectionDialogVisible.value = false;
      } catch (error) {
        ElMessage.error(receiptsStore.getError || 'Failed to reject receipt.');
      }
    }
  });
};

</script>

<style scoped>
.payment-receipt-list {
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
