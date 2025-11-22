import { Component, OnInit, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterModule } from "@angular/router";
import { catchError } from "rxjs/operators";
import { of } from "rxjs";

import { AppointmentsService } from "../../../services/appointment.service";
import {
  Appointment,
  AppointmentStatus,
} from "../../../interfaces/appointments";
import { AvatarComponent } from "../../../shared/avatar/avatar.component";

type LoadState = "loading" | "loaded" | "error";

@Component({
  selector: "app-my-schedules",
  standalone: true,
  imports: [CommonModule, RouterModule, AvatarComponent],
  templateUrl: "./my-appointments.component.html",
})
export class MyAppointmentsComponent implements OnInit {
  private appointmentsService = inject(AppointmentsService);
  private router = inject(Router);

  appointments = signal<Appointment[]>([]);
  loadState = signal<LoadState>("loading");

  statusLabels: Record<AppointmentStatus, string> = {
    [AppointmentStatus.PENDING]: "Pendiente",
    [AppointmentStatus.CONTACTED]: "Contactado",
    [AppointmentStatus.CONFIRMED]: "Confirmada",
    [AppointmentStatus.CANCELLED]: "Cancelada",
  };

  // Clases CSS manuales para reemplazar p-tag
  statusClasses: Record<AppointmentStatus, string> = {
    [AppointmentStatus.PENDING]:
      "text-yellow-500 border-yellow-500/30 bg-yellow-500/10",
    [AppointmentStatus.CONTACTED]:
      "text-sky-400 border-sky-500/30 bg-sky-500/10",
    [AppointmentStatus.CONFIRMED]:
      "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    [AppointmentStatus.CANCELLED]:
      "text-red-500 border-red-500/30 bg-red-500/10",
  };

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.loadState.set("loading");
    this.appointmentsService
      .findMyAppointments()
      .pipe(
        catchError((err) => {
          console.error("Error cargando citas:", err);
          this.loadState.set("error");
          return of([]);
        })
      )
      .subscribe((data) => {
        // Ordenamos por fecha descendente (la más reciente primero)
        const sortedData = data.sort(
          (a, b) =>
            new Date(b.appointmentDate).getTime() -
            new Date(a.appointmentDate).getTime()
        );
        this.appointments.set(sortedData);
        this.loadState.set("loaded");
      });
  }

  getStatusLabel(status: AppointmentStatus): string {
    return this.statusLabels[status] || status;
  }

  getStatusClass(status: AppointmentStatus): string {
    return this.statusClasses[status] || "text-slate-400 border-slate-500/30";
  }

  onImageError(event: Event) {
    const element = event.target as HTMLImageElement;
    if (element) {
      element.src = "/assets/images/placeholder-property.png";
    }
  }
}
