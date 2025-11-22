import { Injectable, inject, PLATFORM_ID } from "@angular/core";
import { Router, NavigationEnd, ActivatedRouteSnapshot } from "@angular/router";
import { filter } from "rxjs/operators";
import { isPlatformBrowser } from "@angular/common";

@Injectable({
  providedIn: "root",
})
export class ScrollTopService {
  // 1. Inyectamos el ID de la plataforma
  private platformId = inject(PLATFORM_ID);

  constructor(private router: Router) {}

  enable() {
    // 2. VITAL: Si estamos en el servidor, no hacemos NADA.
    // El servidor no necesita hacer scroll ni suscribirse a eventos de navegación para esto.
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        if (!this.isDashboardRoute(this.router.routerState.snapshot.root)) {
          // 3. Aquí ya es 100% seguro usar window
          window.scrollTo(0, 0);
        }
      });
  }

  private isDashboardRoute(route: ActivatedRouteSnapshot): boolean {
    while (route.firstChild) {
      route = route.firstChild;
      if (route.routeConfig?.path === "dashboard") {
        return true;
      }
    }

    return this.router.url.startsWith("/dashboard");
  }
}
