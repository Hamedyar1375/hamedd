<template>
  <el-form ref="topUpFormRef" :model="form" :rules="rules" label-position="top" @submit.prevent="submitForm">
    <el-form-item label="Amount" prop="amount">
      <el-input-number v-model="form.amount" :min="1" :precision="2" :step="1.00" placeholder="e.g., 50.00" style="width: 100%;"></el-input-number>
    </el-form-item>

    <!-- Optional: Payment Method Selection -->
    <!--
    <el-form-item label="Payment Method (Optional)" prop="payment_method_id">
      <el-select v-model="form.payment_method_id" placeholder="Select payment method (if applicable)" style="width: 100%;" clearable>
         <el-option label="Bank Transfer" :value="1"></el-option>
         <el-option label="Crypto USDT" :value="2"></el-option>
      </el-select>
    </el-form-item>
    -->

    <el-form-item label="Proof / Transaction Details" prop="proof_details">
      <el-input
        v-model="form.proof_details"
        type="textarea"
        :rows="3"
        placeholder="Enter your payment transaction ID, reference number, or any other relevant details here."
      ></el-input>
    </el-form-item>

    <el-alert
        v-if="walletStore.getTopUpError"
        :title="walletStore.getTopUpError"
        type="error"
        show-icon
        :closable="false"
        style="margin-bottom: 15px;"
    />

    <el-form-item>
      <el-button @click="onCancel" :disabled="loading">Cancel</el-button>
      <el-button type="primary" native-type="submit" :loading="loading">
        Submit Request
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { ref, reactive, defineProps, defineEmits } from 'vue'; // Removed unused computed
import { ElMessage } from 'element-plus';
import { useResellerWalletStore } from '@/store/resellerWallet';


/* eslint-disable-next-line no-unused-vars */
const props = defineProps({
  loading: { // Prop to control loading state from parent
    type: Boolean,
    default: false,
  }
});

const emit = defineEmits(['submit', 'cancel']);
const walletStore = useResellerWalletStore();

const topUpFormRef = ref(null);
const form = reactive({
  amount: null,
  proof_details: '',
  // payment_method_id: null, // Optional
});

const rules = reactive({
  amount: [
    { required: true, message: "Top-up amount is required", trigger: 'blur' },
    { type: 'number', message: 'Amount must be a number', trigger: 'blur' },
    { validator: (rule, value, callback) => {
        if (value <= 0) {
          callback(new Error('Amount must be greater than 0'));
        } else {
          callback();
        }
      }, trigger: 'blur'
    }
  ],
  proof_details: [{ required: true, message: "Payment proof or transaction details are required", trigger: 'blur' }],
  // payment_method_id: [{ required: false, message: "Please select a payment method", trigger: 'change' }],
});

const submitForm = async () => {
  if (!topUpFormRef.value) return;
  // Clear previous specific error before new submission
  walletStore.$patch({ error: { topUp: null } });

  await topUpFormRef.value.validate((valid) => {
    if (valid) {
      emit('submit', { ...form });
    } else {
      ElMessage.error('Please correct the errors in the form.');
      return false;
    }
  });
};

const onCancel = () => {
  // Clear previous specific error on cancel
  walletStore.$patch({ error: { topUp: null } });
  emit('cancel');
};

// Reset form when dialog is closed (if needed, but parent handles dialog visibility)
// This component can also expose a reset method if parent needs to call it.
</script>

<style scoped>
/* Add any specific styles for the form here if needed */
</style>
