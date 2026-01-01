import { inject } from "@angular/core";
import {
  Router,
  CanActivateFn,
  UrlTree,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from "@angular/router";
import { AuthService } from "../services/auth.service";
import { AuthStatus } from "../enums/auth-status.enum";
import { Observable, filter, map, take } from "rxjs";
import { toObservable } from "@angular/core/rxjs-interop";

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<boolean | UrlTree> => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const { url } = state;

  return toObservable(authService.authStatus).pipe(
    filter((status) => status !== AuthStatus.checking),
    take(1),
    map((status) => {
      if (status === AuthStatus.authenticated) {
        return true;
      } else {
        return router.createUrlTree(["/auth/login"], {
          queryParams: { returnUrl: url },
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

  return toObservable(authService.authStatus).pipe(
    filter((status) => status !== AuthStatus.checking),
    take(1),
    map((status) => {
      if (status === AuthStatus.unauthenticated) {
        return true;
      } else {
        return router.createUrlTree(["/"]);
      }
    })
  );
};

export const flowGuard: CanActivateFn = (): Observable<boolean | UrlTree> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return toObservable(authService.authStatus).pipe(
    filter((status) => status !== AuthStatus.checking),
    take(1),
    map((status) => {
      if (authService.getTempEmailForFlow()) {
        return true;
      }
      return router.createUrlTree(["/auth/login"]);
    })
  );
};

/**
 * Guard para MANAGER o ADMIN.
 * Usado para: Dashboard principal, gestión de usuarios, citas, propiedades.
 */
export const managerOrAdminGuard: CanActivateFn = (): Observable<
  boolean | UrlTree
> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return toObservable(authService.authStatus).pipe(
    filter((status) => status !== AuthStatus.checking),
    take(1),
    map((status) => {
      if (
        status === AuthStatus.authenticated &&
        authService.canAccessDashboard()
      ) {
        return true;
      }

      return router.createUrlTree(["/"]);
    })
  );
};

/**
 * Guard solo para ADMIN (IT/Sistema).
 * Usado para: Action logs, configuración del sistema.
 */
export const adminGuard: CanActivateFn = (): Observable<
  boolean | UrlTree
> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return toObservable(authService.authStatus).pipe(
    filter((status) => status !== AuthStatus.checking),
    take(1),
    map((status) => {
      if (status === AuthStatus.authenticated && authService.isAdmin()) {
        return true;
      }
      return router.createUrlTree(["/"]);
    })
  );
};

/**
 * Guard para cualquier miembro del staff (AGENT, MANAGER, ADMIN).
 * Usado para: Perfil - mis propiedades asignadas.
 */
export const staffGuard: CanActivateFn = (): Observable<
  boolean | UrlTree
> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return toObservable(authService.authStatus).pipe(
    filter((status) => status !== AuthStatus.checking),
    take(1),
    map((status) => {
      if (status === AuthStatus.authenticated && authService.isStaff()) {
        return true;
      }
      return router.createUrlTree(["/"]);
    })
  );
};
