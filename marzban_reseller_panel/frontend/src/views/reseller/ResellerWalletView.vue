<template>
  <div class="reseller-wallet-view">
    <el-row :gutter="20">
      <!-- Wallet Balance Card -->
      <el-col :xs="24" :sm="12" :md="8">
        <el-card class="box-card wallet-balance-card" v-loading="walletStore.isLoadingBalance">
          <template #header>
            <div class="card-header">
              <span><el-icon><WalletFilled /></el-icon> Current Balance</span>
            </div>
          </template>
          <div v-if="walletStore.getBalanceError" class="error-text">
            <el-alert :title="walletStore.getBalanceError" type="error" show-icon :closable="false"/>
          </div>
          <div v-else-if="walletStore.getBalance" class="balance-amount">
            {{ formatCurrency(walletStore.getBalance.balance, walletStore.getBalance.currency) }}
          </div>
          <el-empty v-else-if="!walletStore.isLoadingBalance" description="Balance not available" />
          <el-button
            type="primary"
            @click="topUpDialogVisible = true"
            style="margin-top: 20px;"
            :icon="Coin"
            plain
            >
            Request Top-up
          </el-button>
           <el-button @click="refreshBalance" :loading="walletStore.isLoadingBalance" style="margin-top:5px;" text bg>Refresh</el-button>
        </el-card>
      </el-col>

      <!-- Top-up Instructions/Info (Optional) -->
      <el-col :xs="24" :sm="12" :md="16">
         <el-card class="box-card">
            <template #header>
                <span><el-icon><InfoFilled /></el-icon> How to Top-up</span>
            </template>
            <p>To add funds to your wallet:</p>
            <ol>
                <li>Make a payment to the designated account (details provided by admin).</li>
                <li>Click the "Request Top-up" button.</li>
                <li>Fill in the amount and provide your payment proof details (e.g., transaction ID, reference number).</li>
                <li>Submit the request. Your balance will be updated once an admin approves your request.</li>
            </ol>
            <p>Please allow some time for processing. You can track the status of your top-up requests in your transaction history once implemented or via admin communication.</p>
         </el-card>
      </el-col>
    </el-row>

    <!-- Transaction History Card -->
    <el-card class="box-card" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span><el-icon><List /></el-icon> Transaction History</span>
          <el-button @click="refreshTransactions" :loading="walletStore.isLoadingTransactions" text bg>Refresh</el-button>
        </div>
      </template>
       <div v-if="walletStore.isLoadingTransactions && !walletStore.getTransactions.length">
            <el-skeleton :rows="5" animated />
       </div>
      <div v-else-if="walletStore.getTransactionsError" class="error-text">
         <el-alert :title="walletStore.getTransactionsError" type="error" show-icon :closable="false"/>
      </div>
      <el-table :data="walletStore.getTransactions" v-else-if="walletStore.getTransactions.length > 0" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" sortable />
        <el-table-column prop="transaction_type" label="Type" width="120" sortable>
            <template #default="scope">
                <el-tag :type="scope.row.transaction_type === 'credit' ? 'success' : 'warning'">
                    {{ scope.row.transaction_type }}
                </el-tag>
            </template>
        </el-table-column>
        <el-table-column prop="amount" label="Amount" width="150" sortable>
            <template #default="scope">{{ formatCurrency(scope.row.amount, scope.row.currency) }}</template>
        </el-table-column>
        <el-table-column prop="description" label="Description" show-overflow-tooltip />
        <el-table-column prop="created_at" label="Date" width="180" sortable>
            <template #default="scope">{{ formatDate(scope.row.created_at) }}</template>
        </el-table-column>
        <el-table-column prop="related_receipt_id" label="Receipt ID" width="120" />
      </el-table>
      <el-empty v-else description="No transactions found." />
    </el-card>

    <!-- Top-up Request Dialog -->
    <el-dialog v-model="topUpDialogVisible" title="Request Wallet Top-up" width="40%" @closed="resetTopUpForm">
      <TopUpRequestForm
        v-if="topUpDialogVisible"
        @submit="handleTopUpSubmit"
        @cancel="topUpDialogVisible = false"
        :loading="walletStore.isSubmittingTopUp"
      />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, defineAsyncComponent } from 'vue';
import { useResellerWalletStore } from '@/store/resellerWallet';
import { ElMessage } from 'element-plus';
import { WalletFilled, List, Coin, InfoFilled } from '@element-plus/icons-vue';

// Lazy load the form component
const TopUpRequestForm = defineAsyncComponent(() =>
    import('@/components/reseller/wallet/TopUpRequestForm.vue') // To be created
);

const walletStore = useResellerWalletStore();
const topUpDialogVisible = ref(false);

const formatCurrency = (amount, currency = 'USD') => {
  if (amount === null || amount === undefined) return 'N/A';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(amount);
};
const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleString() : 'N/A';

const refreshBalance = () => {
    walletStore.fetchWalletBalance();
};
const refreshTransactions = () => {
    walletStore.fetchTransactionHistory(); // Add params if filters are implemented
};

onMounted(() => {
  walletStore.fetchWalletBalance();
  walletStore.fetchTransactionHistory(); // Fetch initial history
});

const resetTopUpForm = () => {
    // Logic to reset form if needed, handled by TopUpRequestForm itself or here
    walletStore.$patch({ error: { topUp: null } }); // Clear previous top-up errors
};

const handleTopUpSubmit = async (topUpData) => {
  try {
    const response = await walletStore.requestTopUp(topUpData);
    ElMessage.success(response.message || 'Top-up request submitted successfully. It will be processed by an admin.');
    topUpDialogVisible.value = false;
    // Optionally refresh balance or transactions after a delay,
    // but typically balance updates after admin approval.
    // setTimeout(() => walletStore.fetchWalletBalance(), 3000);
  } catch (error) {
    // Error is already set in store, TopUpRequestForm can display it or use ElMessage
    // ElMessage.error(walletStore.getTopUpError || 'Failed to submit top-up request.');
  }
};
</script>

<style scoped>
.reseller-wallet-view {
  padding: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.1em;
}
.card-header .el-icon {
    margin-right: 6px;
}
.wallet-balance-card .balance-amount {
  font-size: 2.5em;
  font-weight: bold;
  color: #409EFF; /* Element Plus primary color */
  text-align: center;
  margin: 10px 0;
}
.error-text {
  color: var(--el-color-danger);
}
.el-card ol {
    padding-left: 20px;
}
.el-card li {
    margin-bottom: 5px;
}
</style>
