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
      clientId: '${MSAL_CLIENT_ID}',
      authority: 'https://login.microsoftonline.com/${TENANT_ID}',
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
        'email'
      ]
    }
  };
}



export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {

  const protectedResourceMap = new Map<string, string[]>();

 

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