# Tienda de Perritos — Frontend (Angular + nginx)

> ⚠️ **MSAL (Azure AD) deshabilitado temporalmente** por fallas en Azure (pendiente soporte de Microsoft).
> El código no se eliminó: está comentado y marcado con `[MSAL-DISABLED] motivo: fallas en Azure, pendiente soporte Microsoft`.
> Mientras tanto hay un **login básico por base de datos** (roles `ADMIN`/`USER`, JWT propio): botón "Iniciar sesión" en la barra de navegación con formulario de usuario y contraseña.
> Credenciales de prueba: `admin` / `admin123` (ADMIN) y `user` / `user123` (USER).
> Las rutas `/dashboard` y `/usuarios` exigen sesión (`/usuarios` solo ADMIN); `/productos` es público y los controles de crear/editar/eliminar solo se ven con rol ADMIN (solo visual; la protección real está en el backend).
> El token se guarda en `localStorage` (`token`) y se envía como `Authorization: Bearer` mediante `auth.interceptor.ts`. Compromiso: `localStorage` es legible por cualquier script de la página, así que un XSS podría robarlo (una cookie `HttpOnly` lo evitaría, a costa de manejar CSRF). Al cargar, se valida con `GET /auth/me` y se descarta si no es válido.

## Levantar el proyecto

Desde el repo del backend (orquesta frontend, BFF, microservicios y PostgreSQL; ahí está también cómo aplicar el script SQL de usuarios sobre una base existente):

```bash
cd ../E1-Cloud-back
docker compose down -v && docker compose up --build
# Frontend: http://localhost
```

Solo el frontend en desarrollo: `npm install && npm start` (http://localhost:4200, requiere el BFF en `http://localhost:8080`).
En producción nginx sirve la SPA y proxea `/api/` hacia el servicio `bff`.

## Cómo reactivar MSAL

Buscar los bloques con `grep -rn "MSAL-DISABLED" .` y, en cada archivo, descomentar el original y eliminar el reemplazo temporal (login por base de datos):

1. `package.json`: mover `@azure/msal-angular`, `@azure/msal-browser` y `@azure/msal-common` desde `_MSAL-DISABLED.dependencies` a `dependencies` (borrar la clave `_MSAL-DISABLED`) y ejecutar `npm install` para regenerar `package-lock.json`.
2. `src/environments/environment.ts` y `environment.prod.ts`: bloque `msal`.
3. `src/main.ts`: descomentar el bootstrap con MSAL (`MsalModule`, factories, `MsalInterceptor`) y borrar el bootstrap activo (incluye `authInterceptor` y el inicializador de sesión). Mantener `provideZoneChangeDetection()` si se conservan los componentes actuales.
4. `src/app/app.routes.ts`: `MsalGuard` en las rutas y la comprobación de cuentas en `adminGuard`; quitar `authGuard`.
5. `src/app/app.component.ts`: `handleRedirectObservable` (clase original con `OnInit`, `MsalService` y `Router`).
6. `src/app/components/header/header.component.ts`: imports MSAL, constructor, `updateAccount`, `login`/`logout` y los botones de la plantilla; borrar el formulario y la lógica de login propio.
7. `src/app/pages/welcome/welcome.component.ts`: botón/texto de login, `login()` y la lógica de `ngOnInit`.
8. `src/app/services/usuario.service.ts`: volver a derivar `esAdmin()` de `/usuarios/me`. Se pueden eliminar `auth.service.ts`, `auth.interceptor.ts` y `auth.guard.ts`.
9. Reactivar también la parte del backend (ver README de `E1-Cloud-back`).

> Nota: `changeDetection: ChangeDetectionStrategy.Eager` en los componentes **no** es parte de MSAL; Angular 22 usa OnPush por defecto y estos componentes actualizan campos planos. No revertirlo.
