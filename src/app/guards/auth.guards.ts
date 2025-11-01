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

export const adminOrSuperAdminGuard: CanActivateFn = (): Observable<
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
        (authService.isAdmin() || authService.isSuperAdmin())
      ) {
        return true;
      }

      return router.createUrlTree(["/"]);
    })
  );
};

export const superAdminGuard: CanActivateFn = (): Observable<
  boolean | UrlTree
> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return toObservable(authService.authStatus).pipe(
    filter((status) => status !== AuthStatus.checking),
    take(1),
    map((status) => {
      if (status === AuthStatus.authenticated && authService.isSuperAdmin()) {
        return true;
      }
      return router.createUrlTree(["/"]);
    })
  );
};
