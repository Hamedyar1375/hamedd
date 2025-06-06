<template>
  <el-form ref="planFormRef" :model="form" :rules="rules" label-width="150px" @submit.prevent="submitForm">
    <el-form-item label="Plan Name" prop="name">
      <el-input v-model="form.name" placeholder="e.g., Standard 50GB Monthly"></el-input>
    </el-form-item>
    <el-form-item label="Data Limit (GB)" prop="data_limit_gb">
      <el-input-number v-model="form.data_limit_gb" :min="1" placeholder="e.g., 50"></el-input-number>
    </el-form-item>
    <el-form-item label="Duration (Days)" prop="duration_days">
      <el-input-number v-model="form.duration_days" :min="1" placeholder="e.g., 30"></el-input-number>
    </el-form-item>
    <el-form-item label="Price" prop="price">
      <el-input-number v-model="form.price" :min="0" :precision="2" :step="0.01" placeholder="e.g., 10.00"></el-input-number>
    </el-form-item>

    <el-form-item>
      <el-button type="primary" native-type="submit" :loading="isLoading">
        {{ isEditMode ? 'Update Plan' : 'Create Plan' }}
      </el-button>
      <el-button @click="onCancel">Cancel</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { ref, reactive, watch, computed, defineProps, defineEmits } from 'vue';
import { ElMessage } from 'element-plus';
import { useAdminPricingPlansStore } from '@/store/adminPricingPlans';

const props = defineProps({
  plan: {
    type: Object,
    default: null,
  },
  isEditMode: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['submit', 'cancel']);

const plansStore = useAdminPricingPlansStore();
const isLoading = computed(() => plansStore.isLoading);

const planFormRef = ref(null);
const form = reactive({
  name: '',
  data_limit_gb: 1,
  duration_days: 30,
  price: 0.00,
});

watch(
  () => props.plan,
  (newPlan) => {
    if (newPlan) {
      form.name = newPlan.name || '';
      form.data_limit_gb = newPlan.data_limit_gb || 1;
      form.duration_days = newPlan.duration_days || 30;
      form.price = newPlan.price || 0.00;
    } else {
      // Reset for create mode
      form.name = '';
      form.data_limit_gb = 1;
      form.duration_days = 30;
      form.price = 0.00;
    }
  },
  { immediate: true, deep: true }
);

const rules = reactive({
  name: [{ required: true, message: "Plan name is required", trigger: 'blur' }],
  data_limit_gb: [
    { required: true, message: "Data limit is required", trigger: 'blur' },
    { type: 'number', message: 'Data limit must be a number', trigger: 'blur' },
    { validator: (rule, value, callback) => {
        if (value <= 0) {
          callback(new Error('Data limit must be greater than 0'));
        } else {
          callback();
        }
      }, trigger: 'blur'
    }
  ],
  duration_days: [
    { required: true, message: "Duration is required", trigger: 'blur' },
    { type: 'number', message: 'Duration must be a number', trigger: 'blur' },
     { validator: (rule, value, callback) => {
        if (value <= 0) {
          callback(new Error('Duration must be greater than 0'));
        } else {
          callback();
        }
      }, trigger: 'blur'
    }
  ],
  price: [
    { required: true, message: "Price is required", trigger: 'blur' },
    { type: 'number', message: 'Price must be a number', trigger: 'blur' },
    { validator: (rule, value, callback) => {
        if (value < 0) {
          callback(new Error('Price cannot be negative'));
        } else {
          callback();
        }
      }, trigger: 'blur'
    }
  ],
});

const submitForm = async () => {
  if (!planFormRef.value) return;
  await planFormRef.value.validate((valid) => {
    if (valid) {
      emit('submit', { ...form });
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
/* Add any specific styles for the form here if needed */
</style>
