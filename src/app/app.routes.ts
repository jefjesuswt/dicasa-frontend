import { Routes } from "@angular/router";
import {
  authGuard,
  unauthGuard,
  adminOrSuperAdminGuard,
} from "./guards/auth.guards";

export const routes: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("./pages/home/home.component").then((m) => m.HomeComponent),
    pathMatch: "full",
  },
  {
    path: "landing",
    loadComponent: () =>
      import("./pages/landing/landing-page.component").then(
        (m) => m.LandingPageComponent
      ),
  },
  {
    path: "contact",
    loadComponent: () =>
      import("./pages/contact/contact.component").then(
        (m) => m.ContactComponent
      ),
  },

  {
    path: "properties",
    loadChildren: () =>
      import("./pages/properties/properties.routes").then(
        (m) => m.PROPERTIES_ROUTES
      ),
  },
  {
    path: "auth",
    loadChildren: () =>
      import("./pages/auth/auth.routes").then((m) => m.AUTH_ROUTES),
    canActivate: [unauthGuard],
  },
  {
    path: "profile",
    loadChildren: () =>
      import("./pages/profile/profile.routes").then((m) => m.PROFILE_ROUTES),
    canActivate: [authGuard],
  },
  {
    path: "dashboard",
    loadChildren: () =>
      import("./pages/dashboard/dashboard.routes").then(
        (m) => m.DASHBOARD_ROUTES
      ),
    canActivate: [authGuard, adminOrSuperAdminGuard],
    data: { preload: false },
  },
  { path: "**", redirectTo: "" },
];
