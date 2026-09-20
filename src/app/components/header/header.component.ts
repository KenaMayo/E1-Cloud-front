import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import { InteractionStatus } from '@azure/msal-browser';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
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

          <button class="nav-btn" routerLink="/usuarios" routerLinkActive="active">
            Usuarios
          </button>
        </nav>

        <div class="auth">
          <span *ngIf="isLoggedIn">
            {{ userEmail }}
          </span>

          <button *ngIf="!isLoggedIn" class="login-btn" (click)="login()">
            Iniciar sesión
          </button>

          <button *ngIf="isLoggedIn" class="logout-btn" (click)="logout()">
            Logout
          </button>
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

  isLoggedIn = false;
  userEmail = '';

  constructor(
    private authService: MsalService,
    private broadcastService: MsalBroadcastService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.updateAccount();

    this.broadcastService.inProgress$
      .pipe(filter((status) => status === InteractionStatus.None))
      .subscribe(() => this.updateAccount());
  }

  private updateAccount(): void {
    const accounts = this.authService.instance.getAllAccounts();

    this.isLoggedIn = accounts.length > 0;
    this.userEmail = accounts[0]?.username ?? '';
  }

  navigate(page: string): void {
    this.router.navigate([`/${page}`]);
  }

  login(): void {
    this.authService.loginRedirect({
      prompt: 'select_account',
      scopes: ['openid', 'profile', 'email', 'api://db0c2b5d-d0b6-4b59-84b1-4ff4bb15f34d/Access']
    }).subscribe();
  }

  logout(): void {
    const account = this.authService.instance.getActiveAccount()
      ?? this.authService.instance.getAllAccounts()[0];

    this.authService.logoutRedirect({
      account: account ?? undefined,
      postLogoutRedirectUri: window.location.origin
    }).subscribe();
  }
}