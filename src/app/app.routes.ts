import { inject } from '@angular/core';
import { CanActivateFn, Router, Routes } from '@angular/router';
import { MsalGuard, MsalService } from '@azure/msal-angular';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProductosComponent } from './pages/productos/productos.component';
import { UsuariosComponent } from './pages/usuarios/usuarios.component';
import { WelcomeComponent } from './pages/welcome/welcome.component';
import { UsuarioService } from './services/usuario.service';

const adminGuard: CanActivateFn = () => {
  const router = inject(Router);

  if (inject(MsalService).instance.getAllAccounts().length === 0) {
    return of(router.createUrlTree(['/']));
  }

  return inject(UsuarioService).esAdmin().pipe(
    map((esAdmin) => esAdmin || router.createUrlTree(['/dashboard'])),
  );
};

export const routes: Routes = [
  { path: '', component: WelcomeComponent, pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent, canActivate: [MsalGuard] },
  { path: 'productos', component: ProductosComponent, canActivate: [MsalGuard] },
  { path: 'usuarios', component: UsuariosComponent, canActivate: [MsalGuard, adminGuard] },
  { path: 'auth/callback', component: DashboardComponent },
];
