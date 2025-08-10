import axios from 'axios';
import keycloak from './keycloak';

const api = axios.create({
  baseURL: '/api' // nginx will proxy this to backend
});

// Attach token to all requests
api.interceptors.request.use(async (config) => {
  if (keycloak && keycloak.token) {
    try {
      await keycloak.updateToken(30); // refresh if expiring soon
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${keycloak.token}`;
    } catch (err) {
      console.warn("Token refresh failed:", err);
      keycloak.login();
    }
  }
  return config;
}, (error) => Promise.reject(error));

export default api;
