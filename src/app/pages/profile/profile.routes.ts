import { Routes } from "@angular/router";
import { ProfileComponent } from "./profile/profile.component";
import { staffGuard } from "../../guards/auth.guards";

export const PROFILE_ROUTES: Routes = [
  {
    path: "",
    component: ProfileComponent,
    children: [
      {
        path: "my-info",
        loadComponent: () =>
          import("./my-info/my-info.component").then((m) => m.MyInfoComponent),
      },
      {
        path: "my-schedules",
        loadComponent: () =>
          import("./my-appointments/my-appointments.component").then(
            (m) => m.MyAppointmentsComponent
          ),
      },
      {
        path: "my-properties",
        loadComponent: () =>
          import("./my-properties/my-properties.component").then(
            (m) => m.MyPropertiesComponent
          ),
        canActivate: [staffGuard], // AGENT, MANAGER, ADMIN pueden ver sus propiedades
      },
      {
        path: "my-properties/edit/:id",
        loadComponent: () =>
          import("../dashboard/property-form/property-form.component").then(
            (m) => m.PropertyFormComponent
          ),
        data: { isAgentMode: true },
        canActivate: [staffGuard],
      },
      {
        path: "",
        redirectTo: "my-info",
        pathMatch: "full",
      },
    ],
  },
];
