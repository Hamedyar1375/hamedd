import axios from 'axios';

const apiClient = axios.create({
  // baseURL defaults to local FastAPI server.
  // User should configure VUE_APP_API_BASE_URL in a .env file for production or different local setups.
  baseURL: process.env.VUE_APP_API_BASE_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// No global request interceptor for tokens here.
// Token management will be handled by individual services (e.g., adminAuthService, resellerAuthService)
// by adding the Authorization header to their specific authenticated calls.

export default apiClient;
