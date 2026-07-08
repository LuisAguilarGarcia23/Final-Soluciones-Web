import { Routes } from '@angular/router';
import { Home } from './pages/home/home/home';
import { Login } from './pages/login/login/login';
import { Registro } from './pages/registro/registro/registro';
import { Dashboard } from './pages/dashboard/dashboard/dashboard';
import { InventarioPage } from './pages/inventario/inventario/inventario';
import { Categorias } from './pages/categorias/categorias/categorias';
import { Usuarios } from './pages/usuarios/usuarios/usuarios';
import { Ventas } from './pages/ventas/ventas/ventas';
import { authGuard } from './guards/auth-guard';
import { roleGuard } from './guards/role-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'login', component: Login },
  { path: 'registro', component: Registro },

  {
  path: 'dashboard',
  canActivate: [authGuard, roleGuard],
  data: { roles: ['ADMIN', 'VENDEDOR'] },
  loadComponent: () =>
    import('./pages/dashboard/dashboard/dashboard').then(m => m.Dashboard),
},
{
  path: 'inventario',
  canActivate: [authGuard, roleGuard],
  data: { roles: ['ADMIN', 'VENDEDOR'] },
  loadComponent: () =>
    import('./pages/inventario/inventario/inventario').then(m => m.InventarioPage),
},
{
  path: 'categorias',
  canActivate: [authGuard, roleGuard],
  data: { roles: ['ADMIN', 'VENDEDOR'] },
  loadComponent: () =>
    import('./pages/categorias/categorias/categorias').then(m => m.Categorias),
},
{
  path: 'ventas',
  canActivate: [authGuard, roleGuard],
  data: { roles: ['ADMIN', 'VENDEDOR'] },
  loadComponent: () =>
    import('./pages/ventas/ventas/ventas').then(m => m.Ventas),
},
{
  path: 'usuarios',
  canActivate: [authGuard, roleGuard],
  data: { roles: ['ADMIN'] },
  loadComponent: () =>
    import('./pages/usuarios/usuarios/usuarios').then(m => m.Usuarios),
},
];
