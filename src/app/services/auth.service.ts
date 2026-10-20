import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Sesion {
  username: string;
  rol: 'ADMIN' | 'USER';
}

interface AuthResponse extends Sesion {
  token: string;
}

const TOKEN_KEY = 'token';

// Login propio por base de datos (reemplazo temporal de MSAL).
// El token se guarda en localStorage: es accesible a cualquier script de la página (riesgo XSS).
@Injectable({ providedIn: 'root' })
export class AuthService {
  private authUrl = environment.apiUrl + '/auth';
  private sesionSubject = new BehaviorSubject<Sesion | null>(null);

  readonly sesion$ = this.sesionSubject.asObservable();

  constructor(private http: HttpClient) {}

  get token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  get sesion(): Sesion | null {
    return this.sesionSubject.value;
  }

  login(username: string, password: string): Observable<Sesion> {
    return this.http.post<AuthResponse>(`${this.authUrl}/login`, { username, password }).pipe(
      tap((resp) => {
        localStorage.setItem(TOKEN_KEY, resp.token);
        this.sesionSubject.next({ username: resp.username, rol: resp.rol });
      }),
      map((resp) => ({ username: resp.username, rol: resp.rol })),
    );
  }

  logout(): void {
    if (this.token) {
      this.http.post(`${this.authUrl}/logout`, {}).subscribe({ error: () => undefined });
    }
    this.limpiarSesion();
  }

  limpiarSesion(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.sesionSubject.next(null);
  }

  // Confirma con /auth/me que el token guardado sigue siendo válido
  validarSesion(): Observable<Sesion | null> {
    if (!this.token) {
      this.sesionSubject.next(null);
      return of(null);
    }
    return this.http.get<Sesion>(`${this.authUrl}/me`).pipe(
      map((resp) => ({ username: resp.username, rol: resp.rol })),
      tap((sesion) => this.sesionSubject.next(sesion)),
      catchError(() => {
        this.limpiarSesion();
        return of(null);
      }),
    );
  }
}
