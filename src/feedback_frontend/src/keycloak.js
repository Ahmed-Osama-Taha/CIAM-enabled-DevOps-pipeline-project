// src/keycloak.js
import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'http://localhost:3050',   // Keycloak base URL
  realm: 'myrealm',
  clientId: 'feedback_frontend'
});

export default keycloak;
