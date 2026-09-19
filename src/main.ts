import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import {
  provideHttpClient,
  withInterceptorsFromDi,
  HTTP_INTERCEPTORS
} from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';

import {
  MsalModule,
  MsalService,
  MsalGuard,
  MsalInterceptor,
  MsalBroadcastService,
  MSAL_INSTANCE,
  MSAL_GUARD_CONFIG,
  MSAL_INTERCEPTOR_CONFIG,
  MsalGuardConfiguration,
  MsalInterceptorConfiguration
} from '@azure/msal-angular';

import {
  PublicClientApplication,
  InteractionType,
  BrowserCacheLocation,
  IPublicClientApplication
} from '@azure/msal-browser';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';


export function MSALInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication({
    auth: {
      clientId: '8585e392-e8ba-489f-b8b5-dcb65c37004e', /*Solo de front */
      authority: 'https://login.microsoftonline.com/fc80740a-8501-4d9b-a246-8fbbd7ac5140',
      redirectUri: window.location.origin,
      postLogoutRedirectUri: window.location.origin
    },

    cache: {
      cacheLocation: BrowserCacheLocation.LocalStorage
    }
  });
}


export function MSALGuardConfigFactory(): MsalGuardConfiguration {
  return {
    interactionType: InteractionType.Redirect,

    authRequest: {
      scopes: [
        'openid',
        'profile',
        'email',
        'api://db0c2b5d-d0b6-4b59-84b1-4ff4bb15f34d/Access'
      ]
    }
  };
}


export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {

  const protectedResourceMap = new Map<string, string[]>();
  protectedResourceMap.set('http://localhost:8080/api/v1', ['api://db0c2b5d-d0b6-4b59-84b1-4ff4bb15f34d/Access']);
 

  return {
    interactionType: InteractionType.Redirect,
    protectedResourceMap
  };
}


bootstrapApplication(AppComponent, {

  providers: [

    provideRouter(routes),

    provideHttpClient(
      withInterceptorsFromDi()
    ),

    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory
    },

    {
      provide: MSAL_GUARD_CONFIG,
      useFactory: MSALGuardConfigFactory
    },
  
    {
      provide: MSAL_INTERCEPTOR_CONFIG,
      useFactory: MSALInterceptorConfigFactory
    },

    MsalService,
    MsalGuard,
    MsalBroadcastService,

    
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true
    }

  ]

})
.catch(err => console.error(err));