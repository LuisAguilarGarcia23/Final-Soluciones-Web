import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Categoria, CategoriaRequest } from '../models/categoria.model';

@Injectable({
  providedIn: 'root',
})
export class CategoriaService {

  private http = inject(HttpClient);
  private readonly apiUrl = '/api/categorias';

  getAll() {
    return this.http.get<Categoria[]>(this.apiUrl);
  }

  getById(id: number) {
    return this.http.get<Categoria>(`${this.apiUrl}/${id}`);
  }

  create(data: CategoriaRequest) {
    return this.http.post<Categoria>(this.apiUrl, data);
  }

  update(id: number, data: CategoriaRequest) {
    return this.http.put<Categoria>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
