// src/keycloak.js
import Keycloak from 'keycloak-js';

// ✅ Point to your Keycloak service (external URL or Ingress)
const keycloak = new Keycloak({
  url: 'http://172.20.10.5:31830', // change to https in prod
  realm: 'myrealm',
  clientId: 'feedback_frontend'
});

export default keycloak;
