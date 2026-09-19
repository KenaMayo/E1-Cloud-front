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


<<<<<<< HEAD


=======
>>>>>>> 93e739eccd955a15cdcca4e20eae86748361c848
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


<<<<<<< HEAD

=======
>>>>>>> 93e739eccd955a15cdcca4e20eae86748361c848
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


<<<<<<< HEAD

=======
>>>>>>> 93e739eccd955a15cdcca4e20eae86748361c848
export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {

  const protectedResourceMap = new Map<string, string[]>();

 

  return {
    interactionType: InteractionType.Redirect,
    protectedResourceMap
  };
}


<<<<<<< HEAD

=======
>>>>>>> 93e739eccd955a15cdcca4e20eae86748361c848
bootstrapApplication(AppComponent, {

  providers: [

<<<<<<< HEAD
   
    provideRouter(routes),    
=======
    provideRouter(routes),

>>>>>>> 93e739eccd955a15cdcca4e20eae86748361c848
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
<<<<<<< HEAD

=======
  
>>>>>>> 93e739eccd955a15cdcca4e20eae86748361c848
    {
      provide: MSAL_INTERCEPTOR_CONFIG,
      useFactory: MSALInterceptorConfigFactory
    },

    MsalService,
    MsalGuard,
    MsalBroadcastService,
<<<<<<< HEAD
=======

    
>>>>>>> 93e739eccd955a15cdcca4e20eae86748361c848
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true
    }

  ]

})
.catch(err => console.error(err));