import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Venta } from '../models/venta.model';

@Injectable({
  providedIn: 'root'
})
export class VentaService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/ventas';

  getAll() {
    return this.http.get<Venta[]>(this.apiUrl);
  }

  create(data: any) {
    return this.http.post<Venta>(this.apiUrl, data);
  }

  update(id: number, data: any) {
    return this.http.put<Venta>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}