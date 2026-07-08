import { Inventario } from './inventario.model';
import { Usuario } from './usuario.model';

export interface Venta {
  id: number;
  fecha: string;
  cantidad: number;
  total: number;
  usuario?: Usuario;
  inventario?: Inventario;
}

export interface VentaRequest {
  fecha: string;
  cantidad: number;
  idUsuario: number;
  idInventario: number;
}
