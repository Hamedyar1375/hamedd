import apiClient from './api'; // Global Axios instance

const loginAdmin = async (username, password) => {
  // FastAPI's OAuth2PasswordRequestForm expects form data
  const formData = new URLSearchParams();
  formData.append('username', username);
  formData.append('password', password);

  const response = await apiClient.post('/auth/token', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  return response.data; // Should contain access_token
};

const fetchAdminMe = async () => {
  const token = localStorage.getItem('admin_token');

  if (!token) {
    return Promise.reject(new Error('No admin token found for fetching user details.'));
  }

  const response = await apiClient.get('/auth/users/me', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.data; // Should contain admin user details
};

export default {
  loginAdmin,
  fetchAdminMe,
};
