import { inject } from '@angular/core';
import { Router, CanActivateFn, UrlTree, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AuthStatus } from '../enums/auth-status.enum';
import { Observable, filter, map, take } from 'rxjs';
// Importa 'toObservable'
import { toObservable } from '@angular/core/rxjs-interop';

/**
 * Espera a que el estado de autenticación NO sea 'checking',
 * luego permite o redirige.
 */
export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<boolean | UrlTree> => { // <-- Devuelve Observable

  const authService = inject(AuthService);
  const router = inject(Router);
  const { url } = state;

  // Convierte la señal authStatus en un Observable
  return toObservable(authService.authStatus).pipe(
    // 1. Espera hasta que el estado NO sea 'checking'
    filter(status => status !== AuthStatus.checking),
    // 2. Toma solo el primer valor que cumpla (evita bucles)
    take(1),
    // 3. Toma la decisión final basada en el estado estable
    map(status => {
      if (status === AuthStatus.authenticated) {
        return true; // Usuario autenticado, permite el paso
      } else {
        // Usuario no autenticado, redirige a login
        return router.createUrlTree(['/auth/login'], {
          queryParams: { returnUrl: url }
        });
      }
    })
  );
};

export const unauthGuard: CanActivateFn = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const { url } = state;

    // Convierte la señal authStatus en un Observable
    return toObservable(authService.authStatus).pipe(
      // 1. Espera hasta que el estado NO sea 'checking'
      filter(status => status !== AuthStatus.checking),
      // 2. Toma solo el primer valor que cumpla (evita bucles)
      take(1),
      // 3. Toma la decisión final basada en el estado estable
      map(status => {
        if (status === AuthStatus.unauthenticated) {
          return true; 
        } else {
          return router.createUrlTree(['/']);
        }
      })
    );
}

export const flowGuard: CanActivateFn = (): Observable<boolean | UrlTree> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return toObservable(authService.authStatus).pipe(
    filter(status => status !== AuthStatus.checking),
    take(1),
    map(status => {
      if (authService.getTempEmailForFlow()) {
        return true;
      }
      return router.createUrlTree(['/auth/login']);
    })
  );
}

/**
 * Guard específico para ADMIN (si lo necesitas por separado).
 * Asume que authGuard ya se ejecutó y esperó.
 */
export const adminGuard: CanActivateFn = (): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAdmin()) {
    return true;
  }
  return router.createUrlTree(['/']); 
};


/**
 * Guard combinado para ADMIN o SUPERADMIN.
 * Asume que authGuard ya se ejecutó y esperó.
 */
export const adminOrSuperAdminGuard: CanActivateFn = (): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Puede ser síncrono
  if (authService.isAdmin() || authService.isSuperAdmin()) {
    return true;
  }
  return router.createUrlTree(['/']); // Redirige si no tiene rol
};

/**
 * Guard específico para SUPERADMIN.
 * Asume que authGuard ya se ejecutó y esperó.
 */
export const superAdminGuard: CanActivateFn = (): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

   // Puede ser síncrono
  if (authService.isSuperAdmin()) {
    return true;
  }
  return router.createUrlTree(['/']); // Redirige si no es superadmin
};

