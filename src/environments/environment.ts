export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api/v1',
  msal: {
    clientId: '8585e392-e8ba-489f-b8b5-dcb65c37004e',
    authority: 'https://login.microsoftonline.com/fc80740a-8501-4d9b-a246-8fbbd7ac5140',
    scopes: ['openid', 'profile', 'email', 'api://db0c2b5d-d0b6-4b59-84b1-4ff4bb15f34d/Access'],
    apiScopes: ['api://db0c2b5d-d0b6-4b59-84b1-4ff4bb15f34d/Access'],
  },
};
