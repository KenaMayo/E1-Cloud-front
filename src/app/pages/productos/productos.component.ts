import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService, Producto } from '../../services/producto.service';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="productos">
      <h2>Gestión de Productos</h2>

      <div class="controls">
        <input [(ngModel)]="filtro" placeholder="Buscar por nombre..." class="search">
        <button (click)="buscar()" class="btn-primary">Buscar</button>
        <button (click)="cargarTodos()" class="btn-secondary">Mostrar Todos</button>
        <button (click)="mostrarFormulario = true" class="btn-success">+ Nuevo Producto</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let p of productos">
            <td>{{ p.id }}</td>
            <td>{{ p.nombre }}</td>
            <td>{{ p.descripcion }}</td>
            <td>\${{ p.precio }}</td>
            <td>{{ p.stock }}</td>
            <td>
              <button (click)="editar(p)" class="btn-sm btn-edit">Editar</button>
              <button (click)="eliminar(p.id!)" class="btn-sm btn-danger">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div *ngIf="mostrarFormulario" class="modal">
        <div class="modal-content">
          <h3>{{ editando ? 'Editar' : 'Nuevo' }} Producto</h3>
          <div class="form-group">
            <label>Nombre</label>
            <input [(ngModel)]="formulario.nombre" placeholder="Nombre del producto">
          </div>
          <div class="form-group">
            <label>Descripción</label>
            <textarea [(ngModel)]="formulario.descripcion" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label>Precio</label>
            <input [(ngModel)]="formulario.precio" type="number" step="0.01">
          </div>
          <div class="form-group">
            <label>Stock</label>
            <input [(ngModel)]="formulario.stock" type="number">
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
    .productos { padding: 20px; }
    .controls {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }
    .search {
      flex: 1;
      min-width: 200px;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 12px;
      text-align: left;
    }
    th {
      background: #f3f4f6;
      font-weight: 600;
    }
    tr:nth-child(even) { background: #f9fafb; }
    .btn-primary, .btn-secondary, .btn-success, .btn-edit {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .btn-primary { background: #667eea; color: white; }
    .btn-secondary { background: #6b7280; color: white; }
    .btn-success { background: #16a34a; color: white; }
    .btn-edit { background: #2563eb; color: white; }
    .btn-danger { background: #dc2626; color: white; }
    .btn-sm { padding: 4px 8px; font-size: 0.85rem; }
    .modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    .modal-content {
      background: white;
      padding: 30px;
      border-radius: 8px;
      max-width: 500px;
      width: 90%;
    }
    .form-group {
      margin-bottom: 15px;
    }
    .form-group label {
      display: block;
      margin-bottom: 5px;
      font-weight: 600;
    }
    .form-group input, .form-group textarea {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-sizing: border-box;
    }
    .form-actions {
      display: flex;
      gap: 10px;
      margin-top: 20px;
    }
    .error { color: #dc2626; background: #fee2e2; padding: 10px; border-radius: 4px; margin-top: 20px; }
    .success { color: #16a34a; background: #dcfce7; padding: 10px; border-radius: 4px; margin-top: 20px; }
  `]
})
export class ProductosComponent implements OnInit {
  productos: Producto[] = [];
  formulario: Producto = { nombre: '', precio: 0, stock: 0 };
  filtro = '';
  mostrarFormulario = false;
  editando = false;
  error = '';
  mensaje = '';

  constructor(private productoService: ProductoService) {}

  ngOnInit(): void {
    this.cargarTodos();
  }

  cargarTodos(): void {
    this.productoService.obtenerTodos().subscribe({
      next: (data) => {
        this.productos = data;
        this.mostrarFormulario = false;
        this.formulario = { nombre: '', precio: 0, stock: 0 };
      },
      error: (err) => this.error = 'Error cargando productos',
    });
  }

  buscar(): void {
    if (!this.filtro.trim()) {
      this.cargarTodos();
      return;
    }
    this.productoService.buscarPorNombre(this.filtro).subscribe({
      next: (data) => this.productos = data,
      error: (err) => this.error = 'Error en búsqueda',
    });
  }

  editar(producto: Producto): void {
    this.formulario = { ...producto };
    this.mostrarFormulario = true;
    this.editando = true;
  }

  guardar(): void {
    const operacion = this.editando
      ? this.productoService.actualizar(this.formulario.id!, this.formulario)
      : this.productoService.crear(this.formulario);

    operacion.subscribe({
      next: () => {
        this.mensaje = this.editando ? 'Producto actualizado' : 'Producto creado';
        this.editando = false;
        this.cargarTodos();
        setTimeout(() => this.mensaje = '', 3000);
      },
      error: (err) => this.error = 'Error guardando producto',
    });
  }

  eliminar(id: number): void {
    if (confirm('¿Eliminar este producto?')) {
      this.productoService.eliminar(id).subscribe({
        next: () => {
          this.mensaje = 'Producto eliminado';
          this.cargarTodos();
          setTimeout(() => this.mensaje = '', 3000);
        },
        error: (err) => this.error = 'Error eliminando producto',
      });
    }
  }
}
