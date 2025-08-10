import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import keycloak from './keycloak';

// Initialize Keycloak
keycloak.init({
  onLoad: 'login-required',
  checkLoginIframe: false,
  pkceMethod: 'S256', // needed for OIDC
  enableLogging: true
}).then(authenticated => {
  if (!authenticated) {
    console.warn("User is not authenticated!");
    keycloak.login();
  } else {
    console.log("User authenticated");

    // Make token globally accessible
    window.keycloak = keycloak;

    // Auto-refresh token every 60 seconds
    setInterval(() => {
      keycloak.updateToken(60).catch(() => {
        console.warn("Token refresh failed, redirecting to login...");
        keycloak.login();
      });
    }, 60000);

    ReactDOM.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
      document.getElementById('root')
    );
  }
}).catch(error => {
  console.error("Keycloak initialization failed:", error);
});
