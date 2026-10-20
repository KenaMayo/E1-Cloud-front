import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
// [MSAL-DISABLED] motivo: fallas en Azure, pendiente soporte Microsoft
// import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
// import { InteractionStatus } from '@azure/msal-browser';
// import { filter } from 'rxjs/operators';
// import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  template: `
    <header class="header">
      <div class="header-content">

        <h1>🐕 Tienda de Perritos - Cloud Native</h1>

        <nav class="nav">
          <button *ngIf="isLoggedIn" class="nav-btn" routerLink="/dashboard" routerLinkActive="active">
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
          <span *ngIf="isLoggedIn" class="user-info">
            {{ username }} <small class="rol">{{ rol }}</small>
          </span>

          <button *ngIf="!isLoggedIn" class="login-btn" (click)="abrirLogin()">
            Iniciar sesión
          </button>

          <button *ngIf="isLoggedIn" class="logout-btn" (click)="logout()">
            Cerrar sesión
          </button>

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

    <div class="overlay" *ngIf="mostrarLogin" (click)="cerrarLogin()">
      <form class="login-form" (click)="$event.stopPropagation()" (ngSubmit)="enviarLogin()" #f="ngForm">
        <h2>Iniciar sesión</h2>

        <label for="username">Usuario</label>
        <input id="username" name="username" [(ngModel)]="usernameForm" required autocomplete="username" autofocus />

        <label for="password">Contraseña</label>
        <input id="password" name="password" type="password" [(ngModel)]="passwordForm" required
               autocomplete="current-password" />

        <p class="error" *ngIf="error" role="alert">{{ error }}</p>

        <div class="actions">
          <button type="button" class="btn-cancel" (click)="cerrarLogin()">Cancelar</button>
          <button type="submit" class="btn-submit" [disabled]="cargando || f.invalid">
            {{ cargando ? 'Ingresando...' : 'Ingresar' }}
          </button>
        </div>
      </form>
    </div>
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

    .rol {
      background: rgba(255, 255, 255, 0.3);
      border-radius: 4px;
      padding: 0.1rem 0.4rem;
      margin-left: 0.25rem;
    }

    .overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .login-form {
      background: white;
      color: #263238;
      padding: 1.5rem 2rem;
      border-radius: 8px;
      width: 320px;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .login-form h2 {
      margin: 0 0 0.5rem;
    }

    .login-form input {
      padding: 0.5rem;
      border: 1px solid #b0bec5;
      border-radius: 4px;
      font-size: 1rem;
    }

    .error {
      color: #c62828;
      margin: 0.25rem 0;
      font-size: 0.9rem;
    }

    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }

    .btn-cancel,
    .btn-submit {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .btn-cancel {
      background: #eceff1;
    }

    .btn-submit {
      background: #667eea;
      color: white;
    }

    .btn-submit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `]
})
export class HeaderComponent implements OnInit, OnDestroy {

  // [MSAL-DISABLED] motivo: fallas en Azure, pendiente soporte Microsoft
  // isLoggedIn = false;
  isLoggedIn = false;
  esAdmin = false;
  username = '';
  rol = '';

  mostrarLogin = false;
  usernameForm = '';
  passwordForm = '';
  error = '';
  cargando = false;

  private subscription?: Subscription;

  constructor(
    // [MSAL-DISABLED] motivo: fallas en Azure, pendiente soporte Microsoft
    // private authService: MsalService,
    // private broadcastService: MsalBroadcastService,
    private router: Router,
    private auth: AuthService,
  ) {}

  ngOnInit(): void {
    // [MSAL-DISABLED] motivo: fallas en Azure, pendiente soporte Microsoft
    // this.updateAccount();
    //
    // this.broadcastService.inProgress$
    //   .pipe(filter((status) => status === InteractionStatus.None))
    //   .subscribe(() => this.updateAccount());
    this.subscription = this.auth.sesion$.subscribe((sesion) => {
      const habiaSesion = this.isLoggedIn;
      this.isLoggedIn = sesion !== null;
      this.username = sesion?.username ?? '';
      this.rol = sesion?.rol ?? '';
      this.esAdmin = sesion?.rol === 'ADMIN';
      if (habiaSesion && !this.isLoggedIn) {
        this.router.navigate(['/']);
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
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

  abrirLogin(): void {
    this.error = '';
    this.usernameForm = '';
    this.passwordForm = '';
    this.mostrarLogin = true;
  }

  cerrarLogin(): void {
    this.mostrarLogin = false;
  }

  enviarLogin(): void {
    if (!this.usernameForm || !this.passwordForm) {
      return;
    }
    this.cargando = true;
    this.error = '';
    this.auth.login(this.usernameForm.trim(), this.passwordForm).subscribe({
      next: () => {
        this.cargando = false;
        this.mostrarLogin = false;
        this.passwordForm = '';
        this.router.navigate(['/dashboard']);
      },
      error: (e: HttpErrorResponse) => {
        this.cargando = false;
        this.passwordForm = '';
        this.error = e.status === 401
          ? 'Usuario o contraseña incorrectos'
          : 'No se pudo iniciar sesión. Intente nuevamente.';
      },
    });
  }

  logout(): void {
    this.auth.logout();
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