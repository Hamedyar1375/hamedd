<template>
  <el-form ref="resellerFormRef" :model="form" :rules="rules" label-width="150px" @submit.prevent="submitForm">
    <el-form-item label="Username" prop="username">
      <el-input v-model="form.username" placeholder="Reseller's username"></el-input>
    </el-form-item>
    <el-form-item label="Email" prop="email">
      <el-input v-model="form.email" placeholder="Reseller's email address"></el-input>
    </el-form-item>
    <el-form-item label="Password" prop="password">
      <el-input
        v-model="form.password"
        type="password"
        show-password
        :placeholder="isEditMode ? 'Leave blank to keep current password' : 'Enter password'"
        autocomplete="new-password"
      ></el-input>
    </el-form-item>
    <el-form-item label="Full Name" prop="full_name">
      <el-input v-model="form.full_name" placeholder="Reseller's full name (optional)"></el-input>
    </el-form-item>
    <el-form-item label="Default Panel ID" prop="marzban_panel_id">
      <el-input
        v-model.number="form.marzban_panel_id"
        type="number"
        placeholder="Optional: Default Marzban Panel ID for this reseller"
      ></el-input>
       <p class="form-note">Assign a default Marzban Panel this reseller is primarily associated with (optional).</p>
    </el-form-item>
    <el-form-item label="Active Status" prop="is_active">
      <el-switch v-model="form.is_active"></el-switch>
    </el-form-item>

    <el-form-item>
      <el-button type="primary" native-type="submit" :loading="isLoading">
        {{ isEditMode ? 'Update Reseller' : 'Create Reseller' }}
      </el-button>
      <el-button @click="onCancel">Cancel</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { ref, reactive, watch, computed, defineProps, defineEmits } from 'vue';
import { ElMessage } from 'element-plus';
import { useAdminResellersStore } from '@/store/adminResellers';

const props = defineProps({
  reseller: {
    type: Object,
    default: null,
  },
  isEditMode: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['submit', 'cancel']);

const resellersStore = useAdminResellersStore();
const isLoading = computed(() => resellersStore.isLoading);

const resellerFormRef = ref(null);
const form = reactive({
  username: '',
  email: '',
  password: '',
  full_name: '',
  is_active: true,
  marzban_panel_id: null, // Default to null or undefined
});

watch(
  () => props.reseller,
  (newReseller) => {
    if (newReseller) {
      form.username = newReseller.username || '';
      form.email = newReseller.email || '';
      form.password = ''; // Always clear password for edit mode
      form.full_name = newReseller.full_name || '';
      form.is_active = typeof newReseller.is_active === 'boolean' ? newReseller.is_active : true;
      form.marzban_panel_id = newReseller.marzban_panel_id === undefined ? null : newReseller.marzban_panel_id;
    } else {
      // Reset for create mode
      form.username = '';
      form.email = '';
      form.password = '';
      form.full_name = '';
      form.is_active = true;
      form.marzban_panel_id = null;
    }
  },
  { immediate: true, deep: true }
);

const rules = reactive({
  username: [{ required: true, message: "Reseller's username is required", trigger: 'blur' }],
  email: [
    { required: true, message: "Reseller's email is required", trigger: 'blur' },
    { type: 'email', message: 'Please input a valid email address', trigger: ['blur', 'change'] },
  ],
  password: [
    { required: !props.isEditMode, message: "Password is required for new resellers", trigger: 'blur' }
    // Add min length or other password complexity rules if needed
  ],
  marzban_panel_id: [
      { type: 'integer', message: 'Panel ID must be an integer', trigger: 'blur', transform: (value) => value ? Number(value) : null },
      { validator: (rule, value, callback) => {
          if (value !== null && value !== undefined && (isNaN(value) || value <= 0)) {
              callback(new Error('Panel ID must be a positive integer if provided.'));
          } else {
              callback();
          }
        }, trigger: 'blur'
      }
  ]
});

const submitForm = async () => {
  if (!resellerFormRef.value) return;
  await resellerFormRef.value.validate((valid) => {
    if (valid) {
      const dataToSubmit = { ...form };
      if (props.isEditMode && !dataToSubmit.password) {
        delete dataToSubmit.password; // Don't send empty password on update
      }
      if (dataToSubmit.marzban_panel_id === null || dataToSubmit.marzban_panel_id === '') {
          delete dataToSubmit.marzban_panel_id; // Send null or don't send if not provided
      }
      emit('submit', dataToSubmit);
    } else {
      ElMessage.error('Please correct the errors in the form.');
      return false;
    }
  });
};

const onCancel = () => {
  emit('cancel');
};
</script>

<style scoped>
.form-note {
  font-size: 0.8em;
  color: #909399;
  margin-top: 0px;
  line-height: 1.2;
}
</style>
