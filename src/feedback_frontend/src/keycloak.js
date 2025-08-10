// src/keycloak.js
import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'http://172.20.10.5:31830',   // Keycloak base URL
  realm: 'myrealm',
  clientId: 'feedback_frontend'
});

export default keycloak;
