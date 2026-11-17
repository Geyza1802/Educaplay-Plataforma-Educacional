import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const responsavelGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.getResponsavelAtual()) {
    return true;
  }

  return router.createUrlTree(['/login-responsavel']);
};