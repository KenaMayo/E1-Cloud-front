export const environment = {
  production: true,
  apiUrl: 'https://api.tienda-perritos.com/api/v1',
  msal: {
    clientId: 'YOUR_PROD_CLIENT_ID',
    authority: 'https://login.microsoftonline.com/YOUR_TENANT_ID',
    redirectUri: 'https://tienda-perritos.com/auth/callback',
  },
};
