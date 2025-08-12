// AuthService.js
import { UserManager, WebStorageStateStore } from 'oidc-client-ts';

class AuthService {
  constructor() {
    const settings = {
      authority: 'http://172.20.10.5:8080/realms/feedback-realm', // Your Keycloak realm
      client_id: 'feedback_frontend',
      redirect_uri: 'http://172.20.10.5:30080/callback',
      post_logout_redirect_uri: 'http://172.20.10.5:30080',
      response_type: 'code',
      scope: 'openid profile email',
      userStore: new WebStorageStateStore({ store: window.localStorage }),
      automaticSilentRenew: true,
      silent_redirect_uri: 'http://172.20.10.5:30080/silent-callback'
    };

    this.userManager = new UserManager(settings);
    
    // Setup event handlers
    this.userManager.events.addUserLoaded((user) => {
      console.log('User loaded:', user);
    });

    this.userManager.events.addUserUnloaded(() => {
      console.log('User logged out');
    });

    this.userManager.events.addAccessTokenExpired(() => {
      console.log('Access token expired');
      this.login();
    });
  }

  // Login method
  login() {
    return this.userManager.signinRedirect();
  }

  // Logout method
  logout() {
    return this.userManager.signoutRedirect();
  }

  // Handle redirect callback
  handleCallback() {
    return this.userManager.signinRedirectCallback();
  }

  // Get current user
  async getUser() {
    return await this.userManager.getUser();
  }

  // Check if user is authenticated
  async isAuthenticated() {
    const user = await this.getUser();
    return user && !user.expired;
  }

  // Get access token for API calls
  async getAccessToken() {
    const user = await this.getUser();
    return user ? user.access_token : null;
  }

  // Silent token renewal
  renewToken() {
    return this.userManager.signinSilent();
  }
}

// Create singleton instance
const authService = new AuthService();
export default authService;