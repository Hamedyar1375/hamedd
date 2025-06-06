<template>
  <el-form ref="userFormRef" :model="form" :rules="rules" label-position="top" @submit.prevent="submitForm">
    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="Target Marzban Panel" prop="marzban_panel_id">
          <el-select
            v-model="form.marzban_panel_id"
            placeholder="Select a Marzban Panel"
            style="width: 100%;"
            :disabled="isEditMode"
            filterable
          >
            <el-option
              v-for="panel in availablePanels"
              :key="panel.id"
              :label="`${panel.name} (ID: ${panel.id})`"
              :value="panel.id"
            />
          </el-select>
          <p v-if="!availablePanels || availablePanels.length === 0" class="form-note error-text">
            No Marzban panels assigned to you. Please contact admin.
          </p>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="Username" prop="username">
          <el-input v-model="form.username" placeholder="Enter Marzban username" :disabled="isEditMode"></el-input>
           <p v-if="isEditMode" class="form-note">Username cannot be changed after creation.</p>
        </el-form-item>
      </el-col>
    </el-row>

    <el-form-item label="Password" prop="password" v-if="!isEditMode">
      <el-input
        v-model="form.password"
        type="password"
        show-password
        placeholder="Enter password (leave blank to auto-generate if supported)"
        autocomplete="new-password"
      ></el-input>
      <p class="form-note">If left blank, Marzban may auto-generate a password.</p>
    </el-form-item>

    <el-divider>Subscription Settings</el-divider>

    <el-row :gutter="20">
        <el-col :span="12">
            <el-form-item label="Service Plan (Optional)" prop="pricing_plan_id">
                <el-select
                    v-model="form.pricing_plan_id"
                    placeholder="Select a plan (overrides custom settings)"
                    style="width: 100%;"
                    clearable
                    @change="handlePlanSelection"
                >
                    <el-option
                    v-for="plan in availablePlans"
                    :key="plan.id"
                    :label="`${plan.name} (${formatCurrency(plan.reseller_price || plan.price)}, ${plan.data_limit_gb}GB, ${plan.duration_days} days)`"
                    :value="plan.id"
                    />
                </el-select>
                 <p v-if="selectedPlanDetails" class="form-note">
                    Selected Plan Cost: {{ formatCurrency(selectedPlanDetails.reseller_price || selectedPlanDetails.price) }}.
                    Your current wallet balance: {{ formatCurrency(walletStore.getBalance?.balance, walletStore.getBalance?.currency) }}.
                </p>
                 <p v-if="!availablePlans || availablePlans.length === 0" class="form-note">
                    No pricing plans available. Custom settings will be used.
                </p>
            </el-form-item>
        </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="Data Limit (GB)" prop="data_limit_gb">
          <el-input-number v-model="form.data_limit_gb" :min="0" placeholder="e.g., 50" style="width: 100%;" :disabled="!!form.pricing_plan_id"></el-input-number>
          <p class="form-note">Set to 0 for unlimited. Disabled if a plan is selected.</p>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="Subscription Duration (Days)" prop="duration_days">
          <el-input-number v-model="form.duration_days" :min="1" placeholder="e.g., 30" style="width: 100%;" :disabled="!!form.pricing_plan_id"></el-input-number>
           <p class="form-note">Disabled if a plan is selected.</p>
        </el-form-item>
      </el-col>
    </el-row>

    <el-form-item label="Notes/Remarks (Optional)" prop="notes">
        <el-input type="textarea" :rows="2" v-model="form.notes" placeholder="Any notes for this user or subscription"></el-input>
    </el-form-item>

    <el-alert
        v-if="usersStore.errorSubmit"
        :title="usersStore.errorSubmit"
        type="error"
        show-icon
        :closable="false"
        style="margin-bottom: 15px;"
    />

    <el-form-item>
      <el-button @click="onCancel" :disabled="usersStore.submittingUser">Cancel</el-button>
      <el-button type="primary" native-type="submit" :loading="usersStore.submittingUser">
        {{ isEditMode ? 'Update User' : 'Create User' }}
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { ref, reactive, watch, computed, defineProps, defineEmits, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { useResellerUsersStore } from '@/store/resellerUsers';
import { useResellerWalletStore } from '@/store/resellerWallet'; // For balance check

const props = defineProps({
  user: { type: Object, default: null },
  isEditMode: { type: Boolean, default: false },
  availablePanels: { type: Array, default: () => [] }, // {id, name}
  availablePlans: { type: Array, default: () => [] }, // {id, name, data_limit_gb, duration_days, reseller_price/price}
});

const emit = defineEmits(['submit', 'cancel']);

const usersStore = useResellerUsersStore();
const walletStore = useResellerWalletStore(); // For displaying balance

const userFormRef = ref(null);
const form = reactive({
  marzban_panel_id: null,
  username: '',
  password: '',
  data_limit_gb: null,
  duration_days: 30,
  pricing_plan_id: null,
  notes: '',
});

const selectedPlanDetails = computed(() => {
    if (form.pricing_plan_id && props.availablePlans) {
        return props.availablePlans.find(p => p.id === form.pricing_plan_id);
    }
    return null;
});

const formatCurrency = (amount, currency = 'USD') => {
  if (amount === null || amount === undefined) return 'N/A';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(amount);
};


watch(selectedPlanDetails, (plan) => {
    if (plan) {
        form.data_limit_gb = plan.data_limit_gb;
        form.duration_days = plan.duration_days;
    } else if (!props.isEditMode || (props.isEditMode && !props.user?.pricing_plan_id) ) { // only reset if not editing an existing user with custom values
        // Reset to defaults or previous custom values if plan is deselected
        // For create mode, or if editing a user that wasn't on a plan
        form.data_limit_gb = props.user?.data_limit_gb !== undefined ? props.user.data_limit_gb : null;
        form.duration_days = props.user?.duration_days !== undefined ? props.user.duration_days : 30;
    }
});


watch(
  () => props.user,
  (currentUser) => {
    if (currentUser && props.isEditMode) {
      form.marzban_panel_id = currentUser.marzban_panel_id;
      form.username = currentUser.username || '';
      form.password = ''; // Password not typically shown or re-sent unless changed
      form.data_limit_gb = currentUser.data_limit_gb !== undefined ? (currentUser.data_limit_gb / (1024*1024*1024)) : null; // Convert bytes to GB for display
      form.duration_days = currentUser.expire ? Math.ceil((currentUser.expire * 1000 - Date.now()) / (1000 * 60 * 60 * 24)) : null; // Approximate days left or original duration
      // This duration logic is tricky if backend doesn't provide original duration_days.
      // It's often better to allow extending subscription rather than editing duration of current cycle.
      // For simplicity, let's assume backend handles renewal/extension logic, and form shows current state.
      // For "update", we might be sending new data_limit and duration_days for a *new* subscription period or modification.
      form.pricing_plan_id = currentUser.pricing_plan_id || null;
      form.notes = currentUser.notes || ''; // Assuming 'notes' is a field from backend

      // If a plan is selected, it will override data_limit_gb and duration_days via the watcher
      if (form.pricing_plan_id) {
        const plan = props.availablePlans.find(p => p.id === form.pricing_plan_id);
        if (plan) {
            form.data_limit_gb = plan.data_limit_gb;
            form.duration_days = plan.duration_days;
        }
      }

    } else {
      // Reset for create mode
      form.marzban_panel_id = props.availablePanels?.[0]?.id || null; // Default to first panel if available
      form.username = '';
      form.password = '';
      form.data_limit_gb = null;
      form.duration_days = 30;
      form.pricing_plan_id = null;
      form.notes = '';
    }
  },
  { immediate: true, deep: true }
);

const rules = reactive({
  marzban_panel_id: [{ required: true, message: "Target Marzban Panel is required", trigger: 'change' }],
  username: [
    { required: true, message: "Username is required", trigger: 'blur' },
    // Add regex for username if needed e.g. /^[a-zA-Z0-9_]+$/
  ],
  password: [
    // Password optional for edit mode (if not changing)
    // Password optional for create if Marzban auto-generates
    // For now, let's not make it strictly required in UI, backend can handle defaults/errors
  ],
  data_limit_gb: [
    { required: computed(() => !form.pricing_plan_id), message: "Data limit is required if no plan is selected", trigger: 'blur' },
    { type: 'number', message: 'Data limit must be a number', trigger: 'blur' },
  ],
  duration_days: [
    { required: computed(() => !form.pricing_plan_id), message: "Duration is required if no plan is selected", trigger: 'blur' },
    { type: 'number', message: 'Duration must be a number', trigger: 'blur' },
  ],
});

const handlePlanSelection = (planId) => {
    // Watcher for selectedPlanDetails handles updating form fields
    // This function can be used for additional logic if needed when a plan is selected
};

const submitForm = async () => {
  if (!userFormRef.value) return;
  usersStore.$patch({ errorSubmit: null }); // Clear previous submit errors

  await userFormRef.value.validate((valid) => {
    if (valid) {
      const dataToSubmit = { ...form };
      // If not using a plan, ensure data_limit_gb and duration_days are set.
      // If using a plan, these are derived from the plan but can be sent.
      // Backend ResellerMarzbanUserCreateRequest expects:
      // username, password(opt), data_limit_gb, duration_days, marzban_panel_id, pricing_plan_id(opt)
      // Backend ResellerMarzbanUserUpdateRequest expects:
      // data_limit_gb(opt), duration_days(opt), status(opt), pricing_plan_id(opt)

      // Remove password if it's edit mode and password is empty
      if (props.isEditMode && !dataToSubmit.password) {
        delete dataToSubmit.password;
      }
      // Ensure data_limit_gb is sent as bytes if that's what backend expects
      // (Marzban usually takes bytes, but our form is in GB)
      // The backend service for creating reseller users should handle this conversion if needed.
      // For now, assuming backend ResellerMarzbanUserCreateRequest takes GB directly or service handles it.
      // If data_limit_gb is 0, it means unlimited. Backend should interpret 0 or null as unlimited.

      // If notes is empty, don't send it (or send null)
      if (!dataToSubmit.notes) delete dataToSubmit.notes;


      // Warn if wallet balance is insufficient for selected plan (client-side check)
      if (!props.isEditMode && selectedPlanDetails.value) {
          const planCost = selectedPlanDetails.value.reseller_price || selectedPlanDetails.value.price;
          if (walletStore.getBalance && walletStore.getBalance.balance < planCost) {
              ElMessage.warning(`Your wallet balance (${formatCurrency(walletStore.getBalance.balance)}) is less than the selected plan cost (${formatCurrency(planCost)}). User creation might fail if backend enforces balance check.`);
          }
      }

      emit('submit', dataToSubmit);
    } else {
      ElMessage.error('Please correct the errors in the form.');
      return false;
    }
  });
};

const onCancel = () => {
  usersStore.$patch({ errorSubmit: null }); // Clear errors on cancel
  emit('cancel');
};

onMounted(() => {
    if (!walletStore.getBalance && !walletStore.isLoadingBalance) {
        walletStore.fetchWalletBalance();
    }
});

</script>

<style scoped>
.form-note {
  font-size: 0.8em;
  color: #909399;
  margin-top: 0px;
  line-height: 1.2;
}
.error-text {
    color: var(--el-color-error);
}
</style>
