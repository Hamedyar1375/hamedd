<template>
  <div class="login-container">
    <el-card class="login-card">
      <h2>Login</h2>
      <el-form @submit.prevent="handleLogin">
        <el-form-item label="Username">
          <el-input v-model="username" placeholder="Enter username"></el-input>
        </el-form-item>
        <el-form-item label="Password">
          <el-input v-model="password" type="password" placeholder="Enter password"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" native-type="submit" :loading="loading">Login</el-button>
        </el-form-item>
        <el-alert v-if="error" :title="error" type="error" show-icon :closable="false" />
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
// import authService from '@/services/auth'; // Will create this next

export default {
  name: 'LoginView',
  setup() {
    const router = useRouter();
    const username = ref('');
    const password = ref('');
    const loading = ref(false);
    const error = ref('');

    const handleLogin = async () => {
      loading.value = true;
      error.value = '';
      try {
        // const response = await authService.login(username.value, password.value);
        // For now, simulate login and store a dummy token
        localStorage.setItem('access_token', 'dummy_token_replace_with_actual');
        console.log('Login successful, token stored.');
        router.push({ name: 'Dashboard' });
      } catch (err) {
        error.value = err.response?.data?.detail || 'Login failed. Please try again.';
        console.error('Login error:', err);
      } finally {
        loading.value = false;
      }
    };

    return {
      username,
      password,
      loading,
      error,
      handleLogin,
    };
  },
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f2f5;
}
.login-card {
  width: 400px;
  padding: 20px;
}
</style>
