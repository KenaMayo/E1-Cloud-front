import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
// [MSAL-DISABLED] motivo: fallas en Azure, pendiente soporte Microsoft
// import { MsalService } from '@azure/msal-angular';
// import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="welcome">
      <h2>Bienvenido a la Tienda de Perritos</h2>
      <p>Inicie sesión (botón superior derecho) para ver el dashboard. Los productos se pueden consultar sin sesión.</p>
      <!-- [MSAL-DISABLED] motivo: fallas en Azure, pendiente soporte Microsoft
      <h2>Para ver información, inicie sesión</h2>
      <p>Acceda a la tienda para consultar el dashboard, los productos y los usuarios.</p>
      <button class="login-button" (click)="login()">Iniciar sesión</button>
      -->
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
    // [MSAL-DISABLED] motivo: fallas en Azure, pendiente soporte Microsoft
    // private authService: MsalService,
    private router: Router,
    private auth: AuthService,
  ) {}

  ngOnInit(): void {
    // [MSAL-DISABLED] motivo: fallas en Azure, pendiente soporte Microsoft
    // if (this.authService.instance.getAllAccounts().length > 0) {
    //   this.router.navigate(['/dashboard']);
    // }
    if (this.auth.sesion) {
      this.router.navigate(['/dashboard']);
    }
  }

  // [MSAL-DISABLED] motivo: fallas en Azure, pendiente soporte Microsoft
  // login(): void {
  //   this.authService.loginRedirect({
  //     prompt: 'select_account',
  //     scopes: environment.msal.scopes
  //   }).subscribe();
  // }
}