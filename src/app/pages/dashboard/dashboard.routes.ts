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
      {
        path: "appointments",
        loadComponent: () =>
          import(
            "./admin-appointment-list/admin-appointment-list.component"
          ).then((m) => m.AdminAppointmentListComponent),
        canActivate: [superAdminGuard],
      },
      {
        path: "appointments/new",
        loadComponent: () =>
          import(
            "./admin-appointment-form/admin-appointment-form.component"
          ).then((m) => m.AdminAppointmentFormComponent),
        canActivate: [superAdminGuard],
      },
      {
        path: "appointments/edit/:id",
        loadComponent: () =>
          import(
            "./admin-appointment-form/admin-appointment-form.component"
          ).then((m) => m.AdminAppointmentFormComponent),
        canActivate: [superAdminGuard],
      },
    ],
  },
  {
    path: "**",
    redirectTo: "",
  },
];
