import { Routes } from "@angular/router";
import { superAdminGuard } from "../../guards/auth.guards";

export const DASHBOARD_ROUTES: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("./dashboard/dashboard.component").then(
        (m) => m.DashboardComponent
      ),
    children: [
      { path: "", redirectTo: "properties", pathMatch: "full" },
      {
        path: "properties",
        loadComponent: () =>
          import("./property-list/property-list.component").then(
            (m) => m.PropertyListComponent
          ),
      },
      {
        path: "properties/new",
        loadComponent: () =>
          import("./property-form/property-form.component").then(
            (m) => m.PropertyFormComponent
          ),
      },
      {
        path: "properties/edit/:id",
        loadComponent: () =>
          import("./property-form/property-form.component").then(
            (m) => m.PropertyFormComponent
          ),
      },
      {
        path: "users",
        loadComponent: () =>
          import("./user-list/user-list.component").then(
            (m) => m.UserListComponent
          ),
        canActivate: [superAdminGuard],
      },
      {
        path: "users/new",
        loadComponent: () =>
          import("./user-form/user-form.component").then(
            (m) => m.UserFormComponent
          ),
        canActivate: [superAdminGuard],
      },
      {
        path: "users/edit/:id",
        loadComponent: () =>
          import("./user-form/user-form.component").then(
            (m) => m.UserFormComponent
          ),
        canActivate: [superAdminGuard],
      },
      // { path: 'schedule', loadComponent: () => import('./dashboard/schedule/schedule.component').then(m => m.ScheduleComponent) },
    ],
  },
  {
    path: "**",
    redirectTo: "",
  },
];
