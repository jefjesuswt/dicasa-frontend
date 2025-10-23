import { inject } from '@angular/core';
import { Router, CanActivateFn, UrlTree, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AuthStatus } from '../enums/auth-status.enum';

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot, 
  state: RouterStateSnapshot
): boolean  => {

  const {url} = state;
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true; 
  }  
  router.createUrlTree(['/auth/login'], {
    queryParams: { returnUrl: url } 
  });
  return false;
};


export const adminGuard: CanActivateFn = (): boolean => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAdmin() || authService.isSuperAdmin()) {
    return true; // Tiene al menos uno de los roles, permite el paso
  }

  // No es admin, redirige a la raíz
  router.createUrlTree(['/']); 
  return false;
};

export const superAdminGuard: CanActivateFn = (): boolean => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isSuperAdmin()) {
    return true; // Es super admin, permite el paso
  }

  // No es super admin, redirige a la raíz
  router.createUrlTree(['/']); 
  return false;
};
  