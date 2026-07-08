import { Rol } from './auth.model';

export interface Usuario {
  id?: number;
  name: string;
  email: string;
  rol: Rol;
}

export interface UsuarioRequest {
  name: string;
  email: string;
  password: string;
  rol: Rol;
}