<template>
  <div class="reseller-profile-view">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>My Profile</span>
        </div>
      </template>

      <div v-if="authStore.getStatus === 'loading' && !profileForm.username" class="loading-state">
        <el-skeleton :rows="5" animated />
      </div>
      <div v-else-if="authStore.getError && !profileForm.username" class="error-state">
         <el-alert :title="`Error loading profile: ${authStore.getError}`" type="error" show-icon />
      </div>

      <el-form
        v-else
        ref="profileFormRef"
        :model="profileForm"
        :rules="profileRules"
        label-width="150px"
        style="max-width: 600px; margin: 0 auto;"
        @submit.prevent="submitProfileUpdate"
      >
        <el-form-item label="Username" prop="username">
          <el-input v-model="profileForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="Email" prop="email">
          <el-input v-model="profileForm.email"></el-input>
        </el-form-item>
        <el-form-item label="Full Name" prop="full_name">
          <el-input v-model="profileForm.full_name"></el-input>
        </el-form-item>

        <el-divider content-position="left">Change Password (Optional)</el-divider>

        <el-form-item label="Current Password" prop="current_password">
          <el-input
            v-model="profileForm.current_password"
            type="password"
            show-password
            placeholder="Required if changing password"
            autocomplete="current-password"
          ></el-input>
        </el-form-item>
        <el-form-item label="New Password" prop="new_password">
          <el-input
            v-model="profileForm.new_password"
            type="password"
            show-password
            placeholder="Leave blank to keep current"
            autocomplete="new-password"
          ></el-input>
        </el-form-item>
        <el-form-item label="Confirm New Password" prop="confirm_new_password">
          <el-input
            v-model="profileForm.confirm_new_password"
            type="password"
            show-password
            placeholder="Confirm your new password"
            autocomplete="new-password"
          ></el-input>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            native-type="submit"
            :loading="authStore.getStatus === 'loading'"
          >
            Update Profile
          </el-button>
        </el-form-item>
         <el-alert
            v-if="authStore.getError && authStore.getStatus === 'failed'"
            :title="authStore.getError"
            type="error"
            show-icon
            :closable="true"
            style="margin-top: 10px;"
            @close="clearError"
        />
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { useResellerAuthStore } from '@/store/resellerAuth';
import { ElMessage } from 'element-plus';

const authStore = useResellerAuthStore();
const profileFormRef = ref(null);

const profileForm = reactive({
  username: '',
  email: '',
  full_name: '',
  current_password: '',
  new_password: '',
  confirm_new_password: '',
});

const clearError = () => {
    authStore.$patch({ error: null });
}

// Populate form when resellerUser data is available or changes
watch(
  () => authStore.getResellerUser,
  (currentUser) => {
    if (currentUser) {
      profileForm.username = currentUser.username || '';
      profileForm.email = currentUser.email || '';
      profileForm.full_name = currentUser.full_name || '';
      // Do not populate password fields
    }
  },
  { immediate: true, deep: true }
);

onMounted(async () => {
  if (!authStore.getResellerUser && authStore.isAuthenticated) {
    // If user data isn't in store but they are authenticated, try to fetch it
    await authStore.refreshResellerUser();
  }
  // If still no user data (e.g. direct navigation and token expired/invalid)
  // the form will be empty, and guards should redirect if not authenticated.
});

const validatePass = (rule, value, callback) => {
  if (profileForm.new_password && !value) {
    callback(new Error('Please confirm your new password'));
  } else if (value && value !== profileForm.new_password) {
    callback(new Error("New passwords don't match!"));
  } else {
    callback();
  }
};

const validateCurrentPass = (rule, value, callback) => {
    if (profileForm.new_password && !value) {
        callback(new Error('Please enter your current password to set a new one.'));
    } else {
        callback();
    }
}

const profileRules = reactive({
  email: [
    { required: true, message: 'Please input your email', trigger: 'blur' },
    { type: 'email', message: 'Please input a valid email address', trigger: ['blur', 'change'] },
  ],
  full_name: [{ required: false, message: 'Please input your full name', trigger: 'blur' }],
  current_password: [{ validator: validateCurrentPass, trigger: 'blur' }],
  new_password: [
    // Optional: Add complexity rules for new_password
    { min: 6, message: 'Password must be at least 6 characters', trigger: 'blur',  validator: (rule,value,cb) => { if(value && value.length > 0 && value.length < 6) cb(new Error('Password must be at least 6 characters')); else cb(); } }
  ],
  confirm_new_password: [{ validator: validatePass, trigger: 'blur' }],
});

const submitProfileUpdate = async () => {
  if (!profileFormRef.value) return;
  await profileFormRef.value.validate(async (valid) => {
    if (valid) {
      const updateData = {
        email: profileForm.email,
        full_name: profileForm.full_name,
      };
      if (profileForm.new_password) {
        updateData.password = profileForm.new_password;
        // Backend might require current_password for password changes.
        // The reseller_profile.py ResellerProfileUpdate schema does not explicitly list current_password.
        // If it's needed, it should be added here.
        // updateData.current_password = profileForm.current_password;
      }
      // If backend requires current_password to change other details, it should be added.
      // For now, assuming current_password is only for password change itself.
       if (profileForm.new_password && !profileForm.current_password && !authStore.getResellerUser?.is_superuser) { // Superuser might not need current pass
            ElMessage.error('Current password is required to change your password.');
            return;
        }
        if(profileForm.current_password && !profileForm.new_password){ // if current pass is entered but not new pass.
            ElMessage.warning('You entered your current password, but no new password. Profile details (email, full name) will be updated if changed, but password will remain the same.');
        }


      try {
        await authStore.updateProfile(updateData);
        ElMessage.success('Profile updated successfully!');
        // Clear password fields after successful submission
        profileForm.current_password = '';
        profileForm.new_password = '';
        profileForm.confirm_new_password = '';
      } catch (error) {
        // Error is already set in store and displayed by el-alert
        // ElMessage.error(authStore.getError || 'Failed to update profile.');
      }
    } else {
      ElMessage.error('Please correct the errors in the form.');
      return false;
    }
  });
};
</script>

<style scoped>
.reseller-profile-view {
  padding: 20px;
}
.card-header {
  text-align: center;
  font-size: 1.5em;
}
.loading-state, .error-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
</style>
