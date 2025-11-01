import { Component, OnInit, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterModule } from "@angular/router";
import { catchError } from "rxjs/operators";
import { of } from "rxjs";

import { CardModule } from "primeng/card";
import { TagModule } from "primeng/tag";
import { ButtonModule } from "primeng/button";

import { AppointmentsService } from "../../../services/appointment.service";
import {
  Appointment,
  AppointmentStatus,
} from "../../../interfaces/appointments";
import { AvatarComponent } from "../../../shared/avatar/avatar.component";

type LoadState = "loading" | "loaded" | "error";
type TagSeverity =
  | "success"
  | "secondary"
  | "info"
  | "warn"
  | "danger"
  | "contrast"
  | null
  | undefined;

@Component({
  selector: "app-my-schedules",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    AvatarComponent,
    CardModule,
    TagModule,
    ButtonModule,
  ],
  templateUrl: "./my-appointments.component.html",
})
export class MyAppointmentsComponent implements OnInit {
  private appointmentsService = inject(AppointmentsService);
  private router = inject(Router);

  appointments = signal<Appointment[]>([]);
  loadState = signal<LoadState>("loading");

  statusSeverity: Record<AppointmentStatus, TagSeverity> = {
    [AppointmentStatus.PENDING]: "warn",
    [AppointmentStatus.CONTACTED]: "info",
    [AppointmentStatus.CONFIRMED]: "success",
    [AppointmentStatus.CANCELLED]: "danger",
  };

  statusLabels: Record<AppointmentStatus, string> = {
    [AppointmentStatus.PENDING]: "Pendiente",
    [AppointmentStatus.CONTACTED]: "Contactado",
    [AppointmentStatus.CONFIRMED]: "Confirmada",
    [AppointmentStatus.CANCELLED]: "Cancelada",
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
        this.appointments.set(data);
        this.loadState.set("loaded");
      });
  }

  getStatusLabel(status: AppointmentStatus): string {
    return this.statusLabels[status] || status;
  }

  getStatusSeverity(status: AppointmentStatus): TagSeverity {
    return this.statusSeverity[status] || "secondary";
  }

  goToProperty(propertyId: string) {
    if (!propertyId) return;
    this.router.navigate(["/properties", propertyId]);
  }

  onImageError(event: Event) {
    const element = event.target as HTMLImageElement;
    if (element) {
      element.src = "/assets/images/placeholder-property.png";
    }
  }
}
