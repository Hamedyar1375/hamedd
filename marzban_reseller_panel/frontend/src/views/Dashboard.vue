<template>
  <div class="dashboard-container">
    <el-card>
      <h1>Dashboard</h1>
      <p>Welcome to the Marzban Reseller Panel!</p>
      <p>This is a placeholder page for the main dashboard content.</p>
      <el-button type="danger" @click="handleLogout">Logout</el-button>
    </el-card>
  </div>
</template>

<script>
import { useRouter } from 'vue-router';
// import authService from '@/services/auth'; // Will use this later

export default {
  name: 'DashboardView',
  setup() {
    const router = useRouter();

    const handleLogout = () => {
      // authService.logout(); // Will implement this in authService
      localStorage.removeItem('access_token'); // Simple logout
      console.log('User logged out.');
      router.push({ name: 'Login' });
    };

    return {
      handleLogout,
    };
  },
};
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
  min-height: 100vh;
  background-color: #f0f2f5;
}
</style>
