import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Usuario, UsuarioRequest } from '../models/usuario.model';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {

  private http = inject(HttpClient);
  private readonly apiUrl = '/api/usuarios';

  getAll() {
    return this.http.get<Usuario[]>(this.apiUrl);
  }

  getClientes() {
  return this.http.get<Usuario[]>(`${this.apiUrl}/clientes`);
}

  getById(id: number) {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`);
  }

  create(data: UsuarioRequest) {
    return this.http.post<Usuario>(this.apiUrl, data);
  }

  update(id: number, data: UsuarioRequest) {
    return this.http.put<Usuario>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
