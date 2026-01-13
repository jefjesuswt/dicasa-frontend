import { Routes } from "@angular/router";
import { managerOrAdminGuard, adminGuard } from "../../guards/auth.guards";

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
        canActivate: [managerOrAdminGuard],
      },
      {
        path: "users/new",
        loadComponent: () =>
          import("./user-form/user-form.component").then(
            (m) => m.UserFormComponent
          ),
        canActivate: [managerOrAdminGuard],
      },
      {
        path: "users/edit/:id",
        loadComponent: () =>
          import("./user-form/user-form.component").then(
            (m) => m.UserFormComponent
          ),
        canActivate: [managerOrAdminGuard],
      },
      {
        path: "appointments",
        loadComponent: () =>
          import(
            "./admin-appointment-list/admin-appointment-list.component"
          ).then((m) => m.AdminAppointmentListComponent),
        canActivate: [managerOrAdminGuard],
      },
      {
        path: "appointments/new",
        loadComponent: () =>
          import(
            "./admin-appointment-form/admin-appointment-form.component"
          ).then((m) => m.AdminAppointmentFormComponent),
        canActivate: [managerOrAdminGuard],
      },
      {
        path: "appointments/edit/:id",
        loadComponent: () =>
          import(
            "./admin-appointment-form/admin-appointment-form.component"
          ).then((m) => m.AdminAppointmentFormComponent),
        canActivate: [managerOrAdminGuard],
      },
      {
        path: "statistics",
        loadComponent: () =>
          import(
            "./statistics/statistics.component"
          ).then((m) => m.StatisticsComponent),
        canActivate: [managerOrAdminGuard], // MANAGER y ADMIN pueden ver estadísticas
      },
      {
        path: "action-logs",
        loadComponent: () =>
          import(
            "./action-logs/action-logs.component"
          ).then((m) => m.ActionLogsComponent),
        canActivate: [adminGuard], // Solo ADMIN (IT) puede ver logs de acciones
      },
      {
        path: "backup",
        loadComponent: () =>
          import("./backup/backup.component").then(
            (m) => m.BackupComponent
          ),
        canActivate: [managerOrAdminGuard],
      },
      {
        path: "manual",
        loadComponent: () =>
          import("./manual/manual.component").then(
            (m) => m.ManualComponent
          ),
      },

    ],
  },
  {
    path: "**",
    redirectTo: "",
  },
];
