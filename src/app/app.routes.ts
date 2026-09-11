import { Routes } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProductosComponent } from './pages/productos/productos.component';
import { UsuariosComponent } from './pages/usuarios/usuarios.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent, canActivate: [MsalGuard] },
  { path: 'productos', component: ProductosComponent, canActivate: [MsalGuard] },
  { path: 'usuarios', component: UsuariosComponent, canActivate: [MsalGuard] },
  { path: 'auth/callback', component: DashboardComponent },
];
