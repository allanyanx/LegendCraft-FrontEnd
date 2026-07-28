import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = authService.currentUser();

  if (user && user.roles && user.roles.includes('Admin')) {
    return true;
  }

  // Si no es admin, lo mandamos al home o dashboard user
  return router.parseUrl('/home');
};
