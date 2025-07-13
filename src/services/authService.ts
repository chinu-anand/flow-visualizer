import { PublicClientApplication, AuthenticationResult, AccountInfo } from '@azure/msal-browser';

// MSAL configuration
const msalConfig = {
  auth: {
    clientId: process.env.REACT_APP_AZURE_CLIENT_ID || '',
    authority: `https://login.microsoftonline.com/${process.env.REACT_APP_AZURE_TENANT_ID || 'common'}`,
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  }
};

// Authentication request scopes
const loginRequest = {
  scopes: ['User.Read']
};

// Add any API scopes you need access to
const tokenRequest = {
  scopes: ['User.Read', 'https://your-splunk-api-url/.default']
};

class AuthService {
  private msalInstance: PublicClientApplication;
  private account: AccountInfo | null = null;

  constructor() {
    this.msalInstance = new PublicClientApplication(msalConfig);
  }

  /**
   * Initialize the auth service
   */
  public async initialize(): Promise<void> {
    await this.msalInstance.initialize();
    
    // Check if user is already signed in
    const accounts = this.msalInstance.getAllAccounts();
    if (accounts.length > 0) {
      this.account = accounts[0];
    }
  }

  /**
   * Login with redirect
   */
  public async login(): Promise<void> {
    try {
      await this.msalInstance.loginRedirect(loginRequest);
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  }

  /**
   * Handle the redirect response
   */
  public async handleRedirectPromise(): Promise<AuthenticationResult | null> {
    try {
      const response = await this.msalInstance.handleRedirectPromise();
      
      if (response) {
        this.account = response.account;
      } else {
        const accounts = this.msalInstance.getAllAccounts();
        if (accounts.length > 0) {
          this.account = accounts[0];
        }
      }
      
      return response;
    } catch (error) {
      console.error('Error handling redirect:', error);
      throw error;
    }
  }

  /**
   * Get the current user account
   */
  public getAccount(): AccountInfo | null {
    return this.account;
  }

  /**
   * Check if user is authenticated
   */
  public isAuthenticated(): boolean {
    return this.account !== null;
  }

  /**
   * Get access token for API calls
   */
  public async getAccessToken(): Promise<string> {
    if (!this.account) {
      throw new Error('User is not authenticated');
    }

    try {
      const response = await this.msalInstance.acquireTokenSilent({
        ...tokenRequest,
        account: this.account
      });
      
      return response.accessToken;
    } catch (error) {
      // If silent token acquisition fails, try interactive method
      console.error('Silent token acquisition failed, trying interactive method', error);
      
      // acquireTokenRedirect doesn't return a response - it redirects the browser
      // This will trigger a redirect and the app will reload
      this.msalInstance.acquireTokenRedirect(tokenRequest);
      
      // This line will not be reached due to the redirect, but we need to return something
      // to satisfy TypeScript
      return '';
    }
  }

  /**
   * Logout the user
   */
  public logout(): void {
    this.msalInstance.logoutRedirect();
  }
}

// Create singleton instance
const authService = new AuthService();

export default authService;
