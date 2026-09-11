import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuarioService, Dashboard } from '../../services/usuario.service';
import { ProductoService } from '../../services/producto.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard">
      <h2>Dashboard</h2>
      <div class="stats-grid" *ngIf="dashboard">
        <div class="stat-card">
          <h3>Usuario Actual</h3>
          <p>{{ dashboard.usuario.nombre }} {{ dashboard.usuario.apellido }}</p>
          <p class="email">{{ dashboard.usuario.email }}</p>
          <p class="role">{{ dashboard.usuario.roles }}</p>
        </div>
        <div class="stat-card">
          <h3>Total Productos</h3>
          <p class="big-number">{{ dashboard.totalProductos }}</p>
        </div>
        <div class="stat-card">
          <h3>Total Usuarios</h3>
          <p class="big-number">{{ dashboard.totalUsuarios }}</p>
        </div>
      </div>
      <div *ngIf="error" class="error">{{ error }}</div>
    </div>
  `,
  styles: [`
    .dashboard {
      padding: 20px;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }
    .stat-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .stat-card h3 {
      margin-top: 0;
      font-size: 0.9rem;
      opacity: 0.9;
    }
    .big-number {
      font-size: 2.5rem;
      font-weight: bold;
      margin: 10px 0;
    }
    .email {
      font-size: 0.85rem;
      opacity: 0.8;
    }
    .role {
      font-size: 0.8rem;
      background: rgba(255,255,255,0.2);
      display: inline-block;
      padding: 2px 8px;
      border-radius: 3px;
      margin-top: 5px;
    }
    .error {
      color: #dc2626;
      background: #fee2e2;
      padding: 10px;
      border-radius: 4px;
      margin-top: 20px;
    }
  `]
})
export class DashboardComponent implements OnInit {
  dashboard: Dashboard | null = null;
  error = '';

  constructor(private usuarioService: UsuarioService) {}

  ngOnInit(): void {
    this.cargarDashboard();
  }

  cargarDashboard(): void {
    this.usuarioService.obtenerDashboard().subscribe({
      next: (data) => {
        this.dashboard = data;
      },
      error: (err) => {
        this.error = 'Error cargando dashboard: ' + err.message;
      },
    });
  }
}
