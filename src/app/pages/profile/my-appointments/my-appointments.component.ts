import { Component, OnInit, inject, signal, computed } from "@angular/core";
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
type ViewMode = "list" | "calendar";

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  appointments: Appointment[];
}

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

  // Calendar State
  viewMode = signal<ViewMode>("list");
  currentDate = signal<Date>(new Date());

  weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  calendarDays = computed(() => {
    const year = this.currentDate().getFullYear();
    const month = this.currentDate().getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const days: CalendarDay[] = [];

    // Padding days from previous month
    const startDayOfWeek = firstDayOfMonth.getDay(); // 0 (Sunday) to 6 (Saturday)
    const prevMonthLastDay = new Date(year, month, 0).getDate();

    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      days.push(this.createCalendarDay(date, false));
    }

    // Days of current month
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
        const date = new Date(year, month, i);
        days.push(this.createCalendarDay(date, true));
    }

    // Padding days for next month to complete the grid (up to 42 cells typically for 6 rows)
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
        const date = new Date(year, month + 1, i);
        days.push(this.createCalendarDay(date, false));
    }

    return days;
  });

  statusLabels: Record<AppointmentStatus, string> = {
    [AppointmentStatus.PENDING]: "Pendiente",
    [AppointmentStatus.CONTACTED]: "Contactado",
    [AppointmentStatus.COMPLETED]: "Completada",
    [AppointmentStatus.CANCELLED]: "Cancelada",
  };

  // Clases CSS manuales para reemplazar p-tag
  statusClasses: Record<AppointmentStatus, string> = {
    [AppointmentStatus.PENDING]:
      "text-yellow-500 border-yellow-500/30 bg-yellow-500/10",
    [AppointmentStatus.CONTACTED]:
      "text-sky-400 border-sky-500/30 bg-sky-500/10",
    [AppointmentStatus.COMPLETED]:
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

  setViewMode(mode: ViewMode) {
    this.viewMode.set(mode);
  }

  changeMonth(delta: number) {
    const current = this.currentDate();
    this.currentDate.set(new Date(current.getFullYear(), current.getMonth() + delta, 1));
  }

  isSameDate(d1: Date, d2: Date): boolean {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  }

  private createCalendarDay(date: Date, isCurrentMonth: boolean): CalendarDay {
    const today = new Date();
    // Filter appointments for this specific day
    const dayAppointments = this.appointments().filter(app => {
        const appDate = new Date(app.appointmentDate);
        return this.isSameDate(appDate, date);
    });

    return {
        date,
        isCurrentMonth,
        isToday: this.isSameDate(date, today),
        appointments: dayAppointments
    };
  }

  getStatusLabel(status: AppointmentStatus): string {
    return this.statusLabels[status] || status;
  }

  getStatusClass(status: AppointmentStatus): string {
    return this.statusClasses[status] || "text-[var(--text-secondary)] border-[var(--border-light)]";
  }

  onImageError(event: Event) {
    const element = event.target as HTMLImageElement;
    if (element) {
      element.src = "/assets/images/placeholder-property.png";
    }
  }
}
