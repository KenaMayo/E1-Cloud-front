export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api/v1',
  msal: {
    clientId: 'YOUR_CLIENT_ID',
    authority: 'https://login.microsoftonline.com/YOUR_TENANT_ID',
    redirectUri: 'http://localhost:4200/auth/callback',
  },
};
