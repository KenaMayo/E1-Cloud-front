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


/*
 * ============================================
 * CONFIGURACIÓN DE MICROSOFT ENTRA ID
 * ============================================
 */

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


/*
 * ============================================
 * CONFIGURACIÓN DEL GUARD
 * ============================================
 */

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


/*
 * ============================================
 * CONFIGURACIÓN DEL INTERCEPTOR
 * ============================================
 */

export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {

  const protectedResourceMap = new Map<string, string[]>();

  /*
   * Por ahora está vacío.
   *
   * Más adelante agregaremos aquí:
   *
   * API Gateway URL
   *        ↓
   * scope de Microsoft Entra
   *
   * Ejemplo:
   *
   * protectedResourceMap.set(
   *   'https://xxxxx.execute-api.us-east-1.amazonaws.com/',
   *   ['api://xxxxx/access_as_user']
   * );
   */

  return {
    interactionType: InteractionType.Redirect,
    protectedResourceMap
  };
}


/*
 * ============================================
 * ARRANQUE DE ANGULAR
 * ============================================
 */

bootstrapApplication(AppComponent, {

  providers: [

    /*
     * Angular Router
     */
    provideRouter(routes),

    /*
     * HttpClient + interceptores
     */
    provideHttpClient(
      withInterceptorsFromDi()
    ),

    /*
     * Instancia MSAL
     */
    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory
    },

    /*
     * Configuración del Guard
     */
    {
      provide: MSAL_GUARD_CONFIG,
      useFactory: MSALGuardConfigFactory
    },

    /*
     * Configuración del Interceptor
     */
    {
      provide: MSAL_INTERCEPTOR_CONFIG,
      useFactory: MSALInterceptorConfigFactory
    },

    /*
     * Servicios de MSAL
     */
    MsalService,
    MsalGuard,
    MsalBroadcastService,

    /*
     * Interceptor HTTP de MSAL
     */
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true
    }

  ]

})
.catch(err => console.error(err));