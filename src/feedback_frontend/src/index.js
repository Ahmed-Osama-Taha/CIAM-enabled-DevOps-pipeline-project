import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import keycloak from './keycloak';

keycloak.init({ onLoad: 'login-required', checkLoginIframe: false })
  .then(authenticated => {
    if (!authenticated) {
      keycloak.login();
    } else {
      // Save token so fetch() calls can use it
      window.keycloak = keycloak;

      ReactDOM.render(
        <React.StrictMode>
          <App />
        </React.StrictMode>,
        document.getElementById('root')
      );
    }
  })
  .catch(error => {
    console.error('Keycloak initialization failed', error);
  });
