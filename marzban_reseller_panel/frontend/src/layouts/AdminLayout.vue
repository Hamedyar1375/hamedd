<template>
  <el-container class="admin-layout">
    <el-header class="admin-header">
      <div class="logo-title">Marzban Reseller - Admin</div>
      <div class="header-menu">
        <el-dropdown @command="handleCommand">
          <span class="el-dropdown-link">
            <el-avatar icon="el-icon-user-solid" size="small"></el-avatar>
            <span v-if="authStore.adminUser" style="margin-left: 8px;">{{ authStore.adminUser.username }}</span>
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
      <el-aside width="200px" class="admin-sidebar">
        <el-menu
          :default-active="activeMenu"
          class="el-menu-vertical-demo"
          router
        >
          <el-menu-item index="/admin/dashboard">
            <el-icon><HomeFilled /></el-icon>
            <span>Dashboard</span>
          </el-menu-item>
          <el-menu-item index="/admin/users"> <!-- Example: replace with actual route -->
            <el-icon><User /></el-icon>
            <span>Manage Users</span>
          </el-menu-item>
          <el-menu-item index="/admin/settings"> <!-- Example: replace with actual route -->
            <el-icon><Setting /></el-icon>
            <span>Settings</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main class="admin-main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAdminAuthStore } from '@/store/adminAuth';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ArrowDown, HomeFilled, User, Setting, Platform, Avatar, PriceTag, Money, DocumentChecked, DataLine, Refresh } from '@element-plus/icons-vue'; // Import Refresh icon

const route = useRoute();
const router = useRouter();
const authStore = useAdminAuthStore();

const activeMenu = computed(() => route.path);

const handleCommand = (command) => {
  if (command === 'logout') {
    handleLogout();
  } else if (command === 'profile') {
    // Navigate to profile page or open profile modal
    ElMessage.info('Profile page placeholder.');
    // router.push({ name: 'AdminProfile' }); // If you have a profile route
  }
};

const handleLogout = () => {
  ElMessageBox.confirm('Are you sure you want to logout?', 'Logout Confirmation', {
    confirmButtonText: 'Logout',
    cancelButtonText: 'Cancel',
    type: 'warning',
  })
    .then(() => {
      authStore.logout();
      ElMessage.success('Logged out successfully.');
    })
    .catch(() => {
      // User cancelled logout
    });
};

// Fetch user details if not already present (e.g., on page refresh)
if (!authStore.adminUser && authStore.isAuthenticated) {
  authStore.checkAuth();
}
</script>

<style scoped>
.admin-layout {
  height: 100vh;
}
.admin-header {
  background-color: #303133; /* Darker Element Plus background */
  color: #E5EAF3; /* Lighter text for dark background */
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  border-bottom: 1px solid #4C4D4F;
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
  color: #E5EAF3; /* Ensure dropdown link text is visible */
  display: flex;
  align-items: center;
}
.admin-sidebar {
  background-color: #f4f4f5; /* Light grey, similar to Element Plus examples */
  border-right: 1px solid #e0e0e0;
}
.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 200px;
  min-height: 100%; /* Ensure menu takes full height of aside */
}
.admin-main-content {
  padding: 20px;
  background-color: #ffffff; /* White background for main content area */
}
</style>
