export type Rol = 'ADMIN' | 'VENDEDOR' | 'USUARIO';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  id: number;
  token: string;
  name: string;
  email: string;
  rol: Rol;
}

export interface RegistroRequest {
  name: string;
  email: string;
  password: string;
  rol: Exclude<Rol, 'ADMIN'>;
}
