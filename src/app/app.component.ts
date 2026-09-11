import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MsalModule } from '@azure/msal-angular';
import { HeaderComponent } from './components/header/header.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProductosComponent } from './pages/productos/productos.component';
import { UsuariosComponent } from './pages/usuarios/usuarios.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    MsalModule,
    HeaderComponent,
    DashboardComponent,
    ProductosComponent,
    UsuariosComponent,
  ],
  template: `
    <app-header></app-header>
    <main>
      <div class="container">
        <app-dashboard *ngIf="currentPage === 'dashboard'"></app-dashboard>
        <app-productos *ngIf="currentPage === 'productos'"></app-productos>
        <app-usuarios *ngIf="currentPage === 'usuarios'"></app-usuarios>
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
export class AppComponent implements OnInit, OnDestroy {
  currentPage = 'dashboard';
  private destroy$ = new Subject<void>();

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
