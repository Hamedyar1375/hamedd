<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <div class="card-header">
          <span>Admin Panel Login</span>
        </div>
      </template>
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        label-width="100px"
        @submit.prevent="handleLogin"
      >
        <el-form-item label="Username" prop="username">
          <el-input v-model="loginForm.username" placeholder="Enter username" autocomplete="username"></el-input>
        </el-form-item>
        <el-form-item label="Password" prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="Enter password"
            show-password
            autocomplete="current-password"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            native-type="submit"
            :loading="authStore.getStatus === 'loading'"
            style="width: 100%;"
          >
            Login
          </el-button>
        </el-form-item>
        <el-alert
          v-if="authStore.getError && authStore.getStatus === 'failed'"
          :title="authStore.getError"
          type="error"
          show-icon
          :closable="false"
          style="margin-top: 10px;"
        />
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAdminAuthStore } from '@/store/adminAuth';
import { ElMessage } from 'element-plus';

const router = useRouter();
const authStore = useAdminAuthStore();

const loginFormRef = ref(null);
const loginForm = reactive({
  username: '',
  password: '',
});

const loginRules = reactive({
  username: [{ required: true, message: 'Please input username', trigger: 'blur' }],
  password: [{ required: true, message: 'Please input password', trigger: 'blur' }],
});

const handleLogin = async () => {
  if (!loginFormRef.value) return;
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      const success = await authStore.login({
        username: loginForm.username,
        password: loginForm.password,
      });
      if (success) {
        ElMessage.success('Login successful!');
        router.push({ name: 'AdminDashboard' });
      } else {
        // Error is displayed via reactive authStore.getError, no need for ElMessage here
        // unless you want additional notification style.
      }
    } else {
      ElMessage.error('Please fill in all required fields.');
      return false;
    }
  });
};

// If already logged in, redirect to dashboard
onMounted(() => {
  if (authStore.isAuthenticated) {
    // Clear any previous errors when component is mounted and user is already authenticated
    if (authStore.error) {
        authStore.$patch({ error: null, status: 'idle' });
    }
    router.push({ name: 'AdminDashboard' });
  }
});
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f2f5; /* A light grey background */
}
.login-card {
  width: 450px;
  padding: 20px;
}
.card-header {
  text-align: center;
  font-size: 1.5em;
  font-weight: bold;
}
</style>
