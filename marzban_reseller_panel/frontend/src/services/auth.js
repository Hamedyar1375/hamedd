import apiClient from './api'; // Our pre-configured Axios instance
// import { useRouter } from 'vue-router'; // Removed as unused

const login = async (username, password) => {
  const response = await apiClient.post('/auth/token', {
    username: username, // FastAPI's OAuth2PasswordRequestForm expects form data
    password: password,
  }, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded' // Important for FastAPI OAuth2 form
    },
    // Transform request for form data
    transformRequest: [(data) => {
        let formData = new URLSearchParams();
        for (let key in data) {
            formData.append(key, data[key]);
        }
        return formData;
    }]
  });
  if (response.data.access_token) {
    localStorage.setItem('access_token', response.data.access_token);
  }
  return response.data;
};

const logout = () => {
  localStorage.removeItem('access_token');
  // Optionally, could also call a backend /logout endpoint if it exists
};

const getToken = () => {
  return localStorage.getItem('access_token');
};

const isAuthenticated = () => {
  return !!getToken();
};

export default {
  login,
  logout,
  getToken,
  isAuthenticated,
};
