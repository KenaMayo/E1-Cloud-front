import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
// [MSAL-DISABLED] motivo: fallas en Azure, pendiente soporte Microsoft
// import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
// import { InteractionStatus } from '@azure/msal-browser';
// import { filter } from 'rxjs/operators';
// import { environment } from '../../../environments/environment';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="header">
      <div class="header-content">

        <h1>🐕 Tienda de Perritos - Cloud Native</h1>

        <nav class="nav" *ngIf="isLoggedIn">
          <button class="nav-btn" routerLink="/dashboard" routerLinkActive="active">
            Dashboard
          </button>

          <button class="nav-btn" routerLink="/productos" routerLinkActive="active">
            Productos
          </button>

          <button *ngIf="esAdmin" class="nav-btn" routerLink="/usuarios" routerLinkActive="active">
            Usuarios
          </button>
        </nav>

        <div class="auth">
          <span *ngIf="isLoggedIn">
            {{ userEmail }}
          </span>

          <!-- [MSAL-DISABLED] motivo: fallas en Azure, pendiente soporte Microsoft
          <button *ngIf="!isLoggedIn" class="login-btn" (click)="login()">
            Iniciar sesión
          </button>

          <button *ngIf="isLoggedIn" class="logout-btn" (click)="logout()">
            Logout
          </button>
          -->
        </div>

      </div>
    </header>
  `,

  styles: [`
    .header {
      background: linear-gradient(135deg, #f37dbe 0%, #667eea 100%);
      color: white;
      padding: 1rem 2rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    h1 {
      margin: 0;
      font-size: 1.8rem;
    }

    .nav {
      display: flex;
      gap: 1rem;
    }

    .nav-btn,
    .login-btn,
    .logout-btn {
      padding: 0.5rem 1rem;
      border: none;
      background: rgba(255, 255, 255, 0.2);
      color: white;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.95rem;
      transition: background 0.3s;
    }

    .nav-btn:hover,
    .nav-btn.active,
    .login-btn:hover,
    .logout-btn:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    .auth {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
  `]
})
export class HeaderComponent implements OnInit {

  // [MSAL-DISABLED] motivo: fallas en Azure, pendiente soporte Microsoft
  // isLoggedIn = false;
  isLoggedIn = true;
  esAdmin = false;
  userEmail = '';

  constructor(
    // [MSAL-DISABLED] motivo: fallas en Azure, pendiente soporte Microsoft
    // private authService: MsalService,
    // private broadcastService: MsalBroadcastService,
    private router: Router,
    private usuarioService: UsuarioService,
  ) {}

  ngOnInit(): void {
    // [MSAL-DISABLED] motivo: fallas en Azure, pendiente soporte Microsoft
    // this.updateAccount();
    //
    // this.broadcastService.inProgress$
    //   .pipe(filter((status) => status === InteractionStatus.None))
    //   .subscribe(() => this.updateAccount());
    this.usuarioService.obtenerUsuarioActual().subscribe({
      next: (usuario) => this.userEmail = usuario.email,
      error: () => this.userEmail = '',
    });
    this.usuarioService.esAdmin().subscribe((esAdmin) => this.esAdmin = esAdmin);
  }

  // [MSAL-DISABLED] motivo: fallas en Azure, pendiente soporte Microsoft
  // private updateAccount(): void {
  //   const accounts = this.authService.instance.getAllAccounts();
  //
  //   this.isLoggedIn = accounts.length > 0;
  //   this.userEmail = accounts[0]?.username ?? '';
  //
  //   if (this.isLoggedIn) {
  //     this.usuarioService.esAdmin().subscribe((esAdmin) => this.esAdmin = esAdmin);
  //   } else {
  //     this.esAdmin = false;
  //   }
  // }

  navigate(page: string): void {
    this.router.navigate([`/${page}`]);
  }

  // [MSAL-DISABLED] motivo: fallas en Azure, pendiente soporte Microsoft
  // login(): void {
  //   this.authService.loginRedirect({
  //     prompt: 'select_account',
  //     scopes: environment.msal.scopes
  //   }).subscribe();
  // }
  //
  // logout(): void {
  //   const account = this.authService.instance.getActiveAccount()
  //     ?? this.authService.instance.getAllAccounts()[0];
  //
  //   this.authService.logoutRedirect({
  //     account: account ?? undefined,
  //     postLogoutRedirectUri: window.location.origin
  //   }).subscribe();
  // }
}