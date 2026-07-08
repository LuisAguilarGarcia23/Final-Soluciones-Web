import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const rolesPermitidos = route.data['roles'] as string[] | undefined;
  const rolActual = auth.rol();

  if (!rolesPermitidos || rolesPermitidos.length === 0) {
    return true;
  }

  if (rolActual && rolesPermitidos.includes(rolActual)) {
    return true;
  }

  router.navigate(['/home']);
  return false;
};