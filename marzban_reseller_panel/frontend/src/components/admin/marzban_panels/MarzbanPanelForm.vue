<template>
  <el-form ref="panelFormRef" :model="form" :rules="rules" label-width="180px" @submit.prevent="submitForm">
    <el-form-item label="Panel Name" prop="name">
      <el-input v-model="form.name" placeholder="e.g., My Main Panel"></el-input>
    </el-form-item>
    <el-form-item label="API URL" prop="api_url">
      <el-input v-model="form.api_url" placeholder="e.g., http://your-marzban.com:8000"></el-input>
    </el-form-item>
    <el-form-item label="Marzban Admin Username" prop="marzban_admin_username">
      <el-input v-model="form.marzban_admin_username" placeholder="Marzban panel admin username"></el-input>
    </el-form-item>
    <el-form-item label="Marzban Admin Password" prop="marzban_admin_password">
      <el-input
        v-model="form.marzban_admin_password"
        type="password"
        show-password
        placeholder="Marzban panel admin password"
        autocomplete="new-password"
      ></el-input>
      <p v-if="isEditMode && !form.marzban_admin_password" class="password-edit-note">
        Leave blank to keep the existing password.
      </p>
    </el-form-item>

    <!-- Add other fields like notes if necessary -->

    <el-form-item>
      <el-button type="primary" native-type="submit" :loading="isLoading">
        {{ isEditMode ? 'Update Panel' : 'Create Panel' }}
      </el-button>
      <el-button @click="onCancel">Cancel</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { ref, reactive, watch, defineProps, defineEmits } from 'vue';
import { ElMessage } from 'element-plus';
import { useAdminMarzbanPanelsStore } from '@/store/adminMarzbanPanels'; // For loading state

const props = defineProps({
  panel: {
    type: Object,
    default: null,
  },
  isEditMode: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['submit', 'cancel']);

const panelsStore = useAdminMarzbanPanelsStore(); // Access store for loading state
const isLoading = computed(() => panelsStore.isLoading);


const panelFormRef = ref(null);
const form = reactive({
  name: '',
  api_url: '',
  marzban_admin_username: '',
  marzban_admin_password: '',
  // Initialize other fields here
});

// Watch for changes in the panel prop to populate the form for editing
watch(
  () => props.panel,
  (newPanel) => {
    if (newPanel) {
      form.name = newPanel.name || '';
      form.api_url = newPanel.api_url || '';
      form.marzban_admin_username = newPanel.marzban_admin_username || '';
      form.marzban_admin_password = ''; // Always clear password for edit mode for security
      // Populate other fields
    } else {
      // Reset form for create mode or if panel is null
      form.name = '';
      form.api_url = '';
      form.marzban_admin_username = '';
      form.marzban_admin_password = '';
    }
  },
  { immediate: true, deep: true }
);

const rules = reactive({
  name: [{ required: true, message: 'Panel name is required', trigger: 'blur' }],
  api_url: [
    { required: true, message: 'API URL is required', trigger: 'blur' },
    { type: 'url', message: 'Please input a valid URL', trigger: ['blur', 'change'] },
  ],
  marzban_admin_username: [{ required: true, message: 'Marzban admin username is required', trigger: 'blur' }],
  marzban_admin_password: [
    // Password is required only if not in edit mode.
    // If in edit mode, it's optional (to update).
    { required: !props.isEditMode, message: 'Marzban admin password is required', trigger: 'blur' }
  ],
});


const submitForm = async () => {
  if (!panelFormRef.value) return;
  await panelFormRef.value.validate((valid) => {
    if (valid) {
      const panelDataToSubmit = { ...form };
      // If in edit mode and password is blank, don't send it so backend keeps old one
      if (props.isEditMode && !panelDataToSubmit.marzban_admin_password) {
        delete panelDataToSubmit.marzban_admin_password;
      }
      emit('submit', panelDataToSubmit);
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
.password-edit-note {
  font-size: 0.8em;
  color: #909399;
  margin-top: 5px;
}
</style>
