import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { HeaderComponent } from './components/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
  ],
  template: `
    <app-header></app-header>
    <main>
      <div class="container">
        <router-outlet></router-outlet>
      </div>
    </main>
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
export class AppComponent implements OnInit {
  constructor(
    private authService: MsalService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.authService.handleRedirectObservable().subscribe({
      next: (result) => {
        if (result?.account) {
          this.authService.instance.setActiveAccount(result.account);
          this.router.navigate(['/dashboard']);
        }
      },
      error: (error) => console.error('Error procesando el inicio de sesión:', error)
    });
  }
}
