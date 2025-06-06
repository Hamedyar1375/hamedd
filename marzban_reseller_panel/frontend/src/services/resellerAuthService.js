import apiClient from './api'; // Global Axios instance
// To get token directly from store without circular dependency issues,
// it's often better to pass token to service methods or have store call methods.
// For now, direct localStorage access mirrors previous admin setup before full refactor.
// import { useResellerAuthStore } from '@/store/resellerAuth'; // Avoid if it causes issues

const loginReseller = async (username, password) => {
  const formData = new URLSearchParams();
  formData.append('username', username);
  formData.append('password', password);

  // This login call does not require a token in Authorization header
  const response = await apiClient.post('/reseller/auth/token', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  return response.data;
};

const fetchResellerMe = async () => {
  // const resellerAuthStore = useResellerAuthStore(); // Can lead to issues if not careful
  // const token = resellerAuthStore.token;
  const token = localStorage.getItem('reseller_token'); // More direct, less reactive

  if (!token) {
    return Promise.reject(new Error('No reseller token found for fetching user details.'));
  }

  const response = await apiClient.get('/reseller/profile/me', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.data;
};

const updateResellerProfile = async (data) => {
  // data should match ResellerProfileUpdate schema from backend
  // e.g., { email, full_name, password (optional new password), current_password (if required for changes) }
  const token = localStorage.getItem('reseller_token');
  if (!token) {
    return Promise.reject(new Error('No reseller token found for updating profile.'));
  }

  const response = await apiClient.put('/reseller/profile/me', data, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.data; // Should return the updated reseller profile
};

export default {
  loginReseller,
  fetchResellerMe,
  updateResellerProfile,
};
