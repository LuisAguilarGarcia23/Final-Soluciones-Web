import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { LoginRequest, LoginResponse, RegistroRequest, Rol } from '../models/auth.model';
import { Usuario } from '../models/usuario.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private http = inject(HttpClient);
  private readonly apiUrl = '/api/usuarios';
  private readonly storageKey = 'auth_user';

  private authUser = signal<LoginResponse | null>(this.loadFromLocalStorage());

  user = computed(() => this.authUser());
  isAuthenticated = computed(() => this.authUser() !== null);
  rol = computed(() => this.authUser()?.rol ?? null);
  token = computed(() => this.authUser()?.token ?? null);
  userId = computed(() => this.authUser()?.id ?? null);
  userName = computed(() => this.authUser()?.name ?? '');

  constructor() {
    effect(() => {
      const user = this.authUser();

      if (user) {
        localStorage.setItem(this.storageKey, JSON.stringify(user));
      } else {
        localStorage.removeItem(this.storageKey);
      }
    });
  }

  login(data: LoginRequest) {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, data)
      .pipe(
        tap((response) => this.authUser.set(response))
      );
  }

  registro(data: RegistroRequest) {
    return this.http.post<Usuario>(`${this.apiUrl}/registro`, data);
  }

  logout() {
    this.authUser.set(null);
  }

  hasRole(roles: Rol[]) {
    const rol = this.rol();
    return !!rol && roles.includes(rol);
  }

  private loadFromLocalStorage(): LoginResponse | null {
    const raw = localStorage.getItem(this.storageKey);

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as LoginResponse;
    } catch {
      localStorage.removeItem(this.storageKey);
      return null;
    }
  }
}
