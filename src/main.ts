import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/platform-browser/http';
import { MsalModule, MsalInterceptor, MsalGuard } from '@azure/msal-angular';
import { PublicClientApplication } from '@azure/msal-browser';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

const msalConfig = {
  auth: {
    clientId: '${MSAL_CLIENT_ID}',
    authority: 'https://login.microsoftonline.com/${TENANT_ID}',
    redirectUri: window.location.origin + '/auth/callback',
  },
  cache: {
    cacheLocation: 'localStorage',
  },
};

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    MsalModule.forRoot(
      new PublicClientApplication(msalConfig),
      [new MsalGuard()],
      [new MsalInterceptor()]
    ),
  ],
});
