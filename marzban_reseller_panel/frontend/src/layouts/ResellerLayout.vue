<template>
  <el-container class="reseller-layout">
    <el-header class="reseller-header">
      <div class="logo-title">Marzban Panel - Reseller</div>
      <div class="header-menu">
        <el-dropdown @command="handleCommand">
          <span class="el-dropdown-link">
            <el-avatar icon="el-icon-user-solid" size="small"></el-avatar>
            <span v-if="authStore.resellerUser" style="margin-left: 8px;">{{ authStore.resellerUser.username }}</span>
            <el-icon class="el-icon--right"><arrow-down /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">Profile</el-dropdown-item>
              <el-dropdown-item command="logout" divided>Logout</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>
    <el-container>
      <el-aside width="200px" class="reseller-sidebar">
        <el-menu
          :default-active="activeMenu"
          class="el-menu-vertical-demo"
          router
        >
          <el-menu-item index="/reseller/dashboard">
            <el-icon><HomeFilled /></el-icon>
            <span>Dashboard</span>
          </el-menu-item>
          <el-menu-item index="/reseller/users">
            <el-icon><User /></el-icon>
            <span>Manage Users</span>
          </el-menu-item>
          <el-menu-item index="/reseller/settings"> <!-- Example: replace with actual route -->
            <el-icon><Setting /></el-icon>
            <span>Settings</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main class="reseller-main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useResellerAuthStore } from '@/store/resellerAuth'; // Use Reseller Store
import { ElMessage, ElMessageBox } from 'element-plus';
import { ArrowDown, HomeFilled, User, Setting, WalletFilled } from '@element-plus/icons-vue'; // Import WalletFilled

const route = useRoute();
const router = useRouter();
const authStore = useResellerAuthStore(); // Use Reseller Store

const activeMenu = computed(() => route.path);

const handleCommand = (command) => {
  if (command === 'logout') {
    handleLogout();
  } else if (command === 'profile') {
    router.push({ name: 'ResellerProfile' });
  }
};

const handleLogout = () => {
  ElMessageBox.confirm('Are you sure you want to logout?', 'Logout Confirmation', {
    confirmButtonText: 'Logout',
    cancelButtonText: 'Cancel',
    type: 'warning',
  })
    .then(() => {
      authStore.logout(); // Call logout from reseller store
      ElMessage.success('Logged out successfully.');
    })
    .catch(() => {
      // User cancelled logout
    });
};

// Fetch reseller user details if not already present (e.g., on page refresh)
if (!authStore.resellerUser && authStore.isAuthenticated) {
  authStore.checkAuth();
}
</script>

<style scoped>
.reseller-layout {
  height: 100vh;
}
.reseller-header {
  background-color: #2b2d30; /* Slightly different dark shade for reseller */
  color: #E5EAF3;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  border-bottom: 1px solid #4A4C4E;
}
.logo-title {
  font-size: 1.2em;
  font-weight: bold;
}
.header-menu {
  display: flex;
  align-items: center;
}
.el-dropdown-link {
  cursor: pointer;
  color: #E5EAF3;
  display: flex;
  align-items: center;
}
.reseller-sidebar {
  background-color: #f0f2f5; /* Lighter sidebar */
  border-right: 1px solid #dcdfe6;
}
.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 200px;
  min-height: 100%;
}
.reseller-main-content {
  padding: 20px;
  background-color: #ffffff;
}
</style>
