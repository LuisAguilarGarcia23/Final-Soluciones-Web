import { Categoria } from './categoria.model';

export interface Inventario {
  id: number;
  producto: string;
  descripcion: string;
  stock: number;
  precio: number;
  categoria?: Categoria;
}

export interface InventarioRequest {
  producto: string;
  descripcion: string;
  stock: number;
  precio: number;
  idCategoria: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}
