import { Injectable } from "@angular/core";
import { Router, NavigationEnd, ActivatedRouteSnapshot } from "@angular/router";
import { filter } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class ScrollTopService {
  constructor(private router: Router) {}

  enable() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        if (!this.isDashboardRoute(this.router.routerState.snapshot.root)) {
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
