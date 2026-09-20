import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="welcome">
      <h2>Para ver información, inicie sesión</h2>
      <p>Acceda a la tienda para consultar el dashboard, los productos y los usuarios.</p>
      <button class="login-button" (click)="login()">Iniciar sesión</button>
    </section>
  `,
  styles: [`
    .welcome {
      padding: 4rem 2rem;
      text-align: center;
    }
    h2 {
      margin: 0 0 1rem;
      color: #263238;
    }
    p {
      margin: 0 auto 2rem;
      color: #546e7a;
      max-width: 560px;
    }
    .login-button {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      background: #667eea;
      color: white;
      cursor: pointer;
      font-size: 1rem;
    }
    .login-button:hover {
      background: #5568d8;
    }
  `]
})
export class WelcomeComponent implements OnInit {
  constructor(
    private authService: MsalService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    if (this.authService.instance.getAllAccounts().length > 0) {
      this.router.navigate(['/dashboard']);
    }
  }

  login(): void {
    this.authService.loginRedirect({
      prompt: 'select_account',
      scopes: ['openid', 'profile', 'email', 'api://db0c2b5d-d0b6-4b59-84b1-4ff4bb15f34d/Access']
    }).subscribe();
  }
}