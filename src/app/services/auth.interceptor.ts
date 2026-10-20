import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token;
  const esApi = req.url.startsWith(environment.apiUrl);
  const esLogin = req.url.endsWith('/auth/login');

  const peticion = token && esApi && !esLogin
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(peticion).pipe(
    catchError((error: HttpErrorResponse) => {
      // Token vencido o inválido: se descarta la sesión
      if (error.status === 401 && token && esApi && !esLogin) {
        auth.limpiarSesion();
      }
      return throwError(() => error);
    }),
  );
};
