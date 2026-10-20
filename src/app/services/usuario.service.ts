import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface Usuario {
  id?: number;
  username?: string;
  password?: string;
  email: string;
  nombre: string;
  apellido: string;
  roles?: string;
  rol?: string;
}

export interface Dashboard {
  usuario: Usuario;
  totalProductos: number;
  totalUsuarios: number;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = environment.apiUrl + '/usuarios';
  private authUrl = environment.apiUrl + '/auth';
  private dashboardUrl = environment.apiUrl + '/dashboard';

  constructor(private http: HttpClient, private auth: AuthService) {}

  obtenerUsuarioActual(): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/me`);
  }

  // Solo visual: la protección real está en el backend
  esAdmin(): Observable<boolean> {
    return this.auth.sesion$.pipe(map((sesion) => sesion?.rol === 'ADMIN'));
  }

  actualizarUsuarioActual(usuario: Usuario): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/me`, usuario);
  }

  obtenerTodos(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl);
  }

  obtenerPorId(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`);
  }

  crear(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(this.apiUrl, usuario);
  }

  actualizar(id: number, usuario: Usuario): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/${id}`, usuario);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  obtenerAuthMe(): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.authUrl}/me`);
  }

  obtenerDashboard(): Observable<Dashboard> {
    return this.http.get<Dashboard>(this.dashboardUrl);
  }
}
