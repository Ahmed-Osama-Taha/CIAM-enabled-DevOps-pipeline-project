// src/feedback_frontend/src/api.js
import axios from 'axios';
import keycloak from './keycloak';

const api = axios.create({
  baseURL: '/api' // nginx proxies /api -> backend service
});

api.interceptors.request.use(async (config) => {
  if (keycloak && keycloak.token) {
    try {
      // ensure token is valid for at least 30 seconds, otherwise refresh
      await keycloak.updateToken(30);
    } catch (err) {
      // token refresh failed -> force login
      console.warn('Keycloak token refresh failed, redirecting to login', err);
      await keycloak.login();
    }
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${keycloak.token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export default api;
