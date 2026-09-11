import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Usuario {
  id?: number;
  email: string;
  nombre: string;
  apellido: string;
  roles?: string;
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

  constructor(private http: HttpClient) {}

  obtenerUsuarioActual(): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/me`);
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
