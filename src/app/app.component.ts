import { ChangeDetectionStrategy, Component } from '@angular/core';
// [MSAL-DISABLED] motivo: fallas en Azure, pendiente soporte Microsoft
// import { OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
// [MSAL-DISABLED] motivo: fallas en Azure, pendiente soporte Microsoft
// import { Router, RouterOutlet } from '@angular/router';
// import { MsalService } from '@azure/msal-angular';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { ChatWidgetComponent } from './components/chat-widget/chat-widget.component';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    ChatWidgetComponent,
  ],
  template: `
    <app-header></app-header>
    <main>
      <div class="container">
        <router-outlet></router-outlet>
      </div>
    </main>
    <app-chat-widget *ngIf="(sesion$ | async)?.rol === 'USER'"></app-chat-widget>
  `,
  styles: [`
    main {
      min-height: calc(100vh - 60px);
      background: #f5f5f5;
      padding: 20px 0;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      padding: 20px;
    }
  `]
})
// [MSAL-DISABLED] motivo: fallas en Azure, pendiente soporte Microsoft
// export class AppComponent implements OnInit {
//   constructor(
//     private authService: MsalService,
//     private router: Router,
//   ) {}
//
//   ngOnInit(): void {
//     this.authService.handleRedirectObservable().subscribe({
//       next: (result) => {
//         if (result?.account) {
//           this.authService.instance.setActiveAccount(result.account);
//           this.router.navigate(['/dashboard']);
//         }
//       },
//       error: (error) => console.error('Error procesando el inicio de sesión:', error)
//     });
//   }
// }
export class AppComponent {
  readonly sesion$ = this.authService.sesion$;

  constructor(private authService: AuthService) {}
}
