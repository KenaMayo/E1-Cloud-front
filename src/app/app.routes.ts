import { inject } from '@angular/core';
import { CanActivateFn, Router, Routes } from '@angular/router';
// [MSAL-DISABLED] motivo: fallas en Azure, pendiente soporte Microsoft
// import { MsalGuard, MsalService } from '@azure/msal-angular';
// [MSAL-DISABLED] motivo: fallas en Azure, pendiente soporte Microsoft
// import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProductosComponent } from './pages/productos/productos.component';
import { UsuariosComponent } from './pages/usuarios/usuarios.component';
import { WelcomeComponent } from './pages/welcome/welcome.component';
import { UsuarioService } from './services/usuario.service';

const adminGuard: CanActivateFn = () => {
  const router = inject(Router);

  // [MSAL-DISABLED] motivo: fallas en Azure, pendiente soporte Microsoft
  // if (inject(MsalService).instance.getAllAccounts().length === 0) {
  //   return of(router.createUrlTree(['/']));
  // }

  return inject(UsuarioService).esAdmin().pipe(
    map((esAdmin) => esAdmin || router.createUrlTree(['/dashboard'])),
  );
};

export const routes: Routes = [
  { path: '', component: WelcomeComponent, pathMatch: 'full' },
  // [MSAL-DISABLED] motivo: fallas en Azure, pendiente soporte Microsoft
  // { path: 'dashboard', component: DashboardComponent, canActivate: [MsalGuard] },
  // { path: 'productos', component: ProductosComponent, canActivate: [MsalGuard] },
  // { path: 'usuarios', component: UsuariosComponent, canActivate: [MsalGuard, adminGuard] },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'productos', component: ProductosComponent },
  { path: 'usuarios', component: UsuariosComponent, canActivate: [adminGuard] },
  { path: 'auth/callback', component: DashboardComponent },
];
