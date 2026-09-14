export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api/v1',
  msal: {
    clientId: 'fc80740a-8501-4d9b-a246-8fbbd7ac5140',
    authority: 'https://login.microsoftonline.com/YOUR_TENANT_ID',
    redirectUri: 'http://localhost:4200/auth/callback',
  },
};
