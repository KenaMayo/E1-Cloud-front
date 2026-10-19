# Tienda de Perritos — Frontend (Angular + nginx)

> ⚠️ **MSAL (Azure AD) deshabilitado temporalmente** por fallas en Azure (pendiente soporte de Microsoft).
> El código no se eliminó: está comentado y marcado con `[MSAL-DISABLED] motivo: fallas en Azure, pendiente soporte Microsoft`.
> Sin login: las rutas `/dashboard`, `/productos` y `/usuarios` son accesibles directamente y `/` redirige a `/dashboard`.

## Levantar el proyecto

Desde el repo del backend (orquesta frontend, BFF, microservicios y PostgreSQL):

```bash
cd ../E1-Cloud-back
docker compose up --build
# Frontend: http://localhost
```

Solo el frontend en desarrollo: `npm install && npm start` (http://localhost:4200, requiere el BFF en `http://localhost:8080`).
En producción nginx sirve la SPA y proxea `/api/` hacia el servicio `bff`.

## Cómo reactivar MSAL

Buscar los bloques con `grep -rn "MSAL-DISABLED" .` y, en cada archivo, descomentar el original y eliminar el reemplazo temporal:

1. `package.json`: mover `@azure/msal-angular`, `@azure/msal-browser` y `@azure/msal-common` desde `_MSAL-DISABLED.dependencies` a `dependencies` (borrar la clave `_MSAL-DISABLED`) y ejecutar `npm install` para regenerar `package-lock.json`.
2. `src/environments/environment.ts` y `environment.prod.ts`: bloque `msal`.
3. `src/main.ts`: descomentar el bootstrap con MSAL (`MsalModule`, factories, `MsalInterceptor`) y borrar el bootstrap temporal. Mantener `provideZoneChangeDetection()` si se conservan los componentes actuales.
4. `src/app/app.routes.ts`: `MsalGuard` en las rutas y la comprobación de cuentas en `adminGuard`.
5. `src/app/app.component.ts`: `handleRedirectObservable` (clase original con `OnInit`, `MsalService` y `Router`).
6. `src/app/components/header/header.component.ts`: imports MSAL, `isLoggedIn = false`, constructor, `updateAccount`, `login`/`logout` y los botones de la plantilla.
7. `src/app/pages/welcome/welcome.component.ts`: botón/texto de login, `login()` y la lógica de `ngOnInit`.
8. Reactivar también la parte del backend (ver README de `E1-Cloud-back`).

> Nota: `changeDetection: ChangeDetectionStrategy.Eager` en los componentes **no** es parte de MSAL; Angular 22 usa OnPush por defecto y estos componentes actualizan campos planos. No revertirlo.
