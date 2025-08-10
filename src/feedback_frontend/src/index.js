import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';  // Global styles
import App from './App';
import keycloak from './keycloak';

keycloak.init({ onLoad: 'login-required', checkLoginIframe: false })
  .then(authenticated => {
    if (!authenticated) {
      keycloak.login();
    } else {
      ReactDOM.render(
        <React.StrictMode>
          <App keycloak={keycloak} />
        </React.StrictMode>,
        document.getElementById('root')
      );
    }
  })
  .catch(error => {
    console.error('Keycloak initialization failed', error);
  });
