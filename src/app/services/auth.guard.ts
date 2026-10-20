import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  return inject(AuthService).validarSesion().pipe(
    take(1),
    map((sesion) => sesion ? true : router.createUrlTree(['/'])),
  );
};
