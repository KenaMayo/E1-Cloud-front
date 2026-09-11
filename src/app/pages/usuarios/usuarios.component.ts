import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService, Usuario } from '../../services/usuario.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="usuarios">
      <h2>Gestión de Usuarios</h2>

      <div class="controls">
        <button (click)="cargarTodos()" class="btn-primary">Cargar Usuarios</button>
        <button (click)="mostrarFormulario = true" class="btn-success">+ Nuevo Usuario</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Email</th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Roles</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let u of usuarios">
            <td>{{ u.id }}</td>
            <td>{{ u.email }}</td>
            <td>{{ u.nombre }}</td>
            <td>{{ u.apellido }}</td>
            <td><span class="badge">{{ u.roles }}</span></td>
            <td>
              <button (click)="editar(u)" class="btn-sm btn-edit">Editar</button>
              <button (click)="eliminar(u.id!)" class="btn-sm btn-danger">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div *ngIf="mostrarFormulario" class="modal">
        <div class="modal-content">
          <h3>{{ editando ? 'Editar' : 'Nuevo' }} Usuario</h3>
          <div class="form-group">
            <label>Email</label>
            <input [(ngModel)]="formulario.email" type="email" placeholder="usuario@example.com" [disabled]="editando">
          </div>
          <div class="form-group">
            <label>Nombre</label>
            <input [(ngModel)]="formulario.nombre" placeholder="Nombre">
          </div>
          <div class="form-group">
            <label>Apellido</label>
            <input [(ngModel)]="formulario.apellido" placeholder="Apellido">
          </div>
          <div class="form-group">
            <label>Roles (separados por coma)</label>
            <input [(ngModel)]="formulario.roles" placeholder="ROLE_USER,ROLE_ADMIN">
          </div>
          <div class="form-actions">
            <button (click)="guardar()" class="btn-primary">Guardar</button>
            <button (click)="mostrarFormulario = false" class="btn-secondary">Cancelar</button>
          </div>
        </div>
      </div>

      <div *ngIf="error" class="error">{{ error }}</div>
      <div *ngIf="mensaje" class="success">{{ mensaje }}</div>
    </div>
  `,
  styles: [`
    .usuarios { padding: 20px; }
    .controls { display: flex; gap: 10px; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
    th { background: #f3f4f6; font-weight: 600; }
    tr:nth-child(even) { background: #f9fafb; }
    .badge { background: #dbeafe; color: #1e40af; padding: 2px 8px; border-radius: 3px; font-size: 0.85rem; }
    .btn-primary, .btn-secondary, .btn-success, .btn-edit {
      padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; }
    .btn-primary { background: #667eea; color: white; }
    .btn-secondary { background: #6b7280; color: white; }
    .btn-success { background: #16a34a; color: white; }
    .btn-edit { background: #2563eb; color: white; }
    .btn-danger { background: #dc2626; color: white; }
    .btn-sm { padding: 4px 8px; font-size: 0.85rem; }
    .modal {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.5); display: flex; justify-content: center;
      align-items: center; z-index: 1000;
    }
    .modal-content {
      background: white; padding: 30px; border-radius: 8px;
      max-width: 500px; width: 90%;
    }
    .form-group { margin-bottom: 15px; }
    .form-group label { display: block; margin-bottom: 5px; font-weight: 600; }
    .form-group input {
      width: 100%; padding: 8px; border: 1px solid #ddd;
      border-radius: 4px; box-sizing: border-box;
    }
    .form-group input:disabled { background: #f3f4f6; }
    .form-actions { display: flex; gap: 10px; margin-top: 20px; }
    .error { color: #dc2626; background: #fee2e2; padding: 10px; border-radius: 4px; margin-top: 20px; }
    .success { color: #16a34a; background: #dcfce7; padding: 10px; border-radius: 4px; margin-top: 20px; }
  `]
})
export class UsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  formulario: Usuario = { email: '', nombre: '', apellido: '' };
  mostrarFormulario = false;
  editando = false;
  error = '';
  mensaje = '';

  constructor(private usuarioService: UsuarioService) {}

  ngOnInit(): void {
    this.cargarTodos();
  }

  cargarTodos(): void {
    this.usuarioService.obtenerTodos().subscribe({
      next: (data) => {
        this.usuarios = data;
        this.mostrarFormulario = false;
        this.formulario = { email: '', nombre: '', apellido: '' };
      },
      error: (err) => this.error = 'Error cargando usuarios',
    });
  }

  editar(usuario: Usuario): void {
    this.formulario = { ...usuario };
    this.mostrarFormulario = true;
    this.editando = true;
  }

  guardar(): void {
    const operacion = this.editando
      ? this.usuarioService.actualizar(this.formulario.id!, this.formulario)
      : this.usuarioService.crear(this.formulario);

    operacion.subscribe({
      next: () => {
        this.mensaje = this.editando ? 'Usuario actualizado' : 'Usuario creado';
        this.editando = false;
        this.cargarTodos();
        setTimeout(() => this.mensaje = '', 3000);
      },
      error: (err) => this.error = 'Error guardando usuario',
    });
  }

  eliminar(id: number): void {
    if (confirm('¿Eliminar este usuario?')) {
      this.usuarioService.eliminar(id).subscribe({
        next: () => {
          this.mensaje = 'Usuario eliminado';
          this.cargarTodos();
          setTimeout(() => this.mensaje = '', 3000);
        },
        error: (err) => this.error = 'Error eliminando usuario',
      });
    }
  }
}
