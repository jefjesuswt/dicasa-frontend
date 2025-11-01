import { Routes } from "@angular/router";
import { ProfileComponent } from "./profile/profile.component";

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
        path: "",
        redirectTo: "my-info",
        pathMatch: "full",
      },
    ],
  },
];
