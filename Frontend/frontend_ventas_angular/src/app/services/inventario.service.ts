import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Inventario, InventarioRequest, PageResponse } from '../models/inventario.model';

@Injectable({
  providedIn: 'root',
})
export class InventarioService {

  private http = inject(HttpClient);
  private readonly apiUrl = '/api/inventarios';

  getAll(page = 0, size = 10) {
  const params = new HttpParams()
    .set('page', page.toString())
    .set('size', size.toString());

  return this.http.get<PageResponse<Inventario> | Inventario[]>(this.apiUrl, { params });
}

  buscar(producto: string, page = 0, size = 10) {
  const params = new HttpParams()
    .set('producto', producto)
    .set('page', page.toString())
    .set('size', size.toString());

  return this.http.get<PageResponse<Inventario> | Inventario[]>(`${this.apiUrl}/buscar`, { params });
}

  getById(id: number) {
    return this.http.get<Inventario>(`${this.apiUrl}/${id}`);
  }

  create(data: InventarioRequest) {
    return this.http.post<Inventario>(this.apiUrl, data);
  }

  update(id: number, data: InventarioRequest) {
    return this.http.put<Inventario>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
