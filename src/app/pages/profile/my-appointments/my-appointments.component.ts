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
import { AuthService } from "../../../services/auth.service"; // Import AuthService
import { ToastService } from "../../../services/toast.service";

type LoadState = "loading" | "loaded" | "error";
type ViewMode = "list" | "calendar";

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  appointments: Appointment[];
}

import { DialogComponent } from "../../../shared/dialog/dialog.component";

@Component({
  selector: "app-my-schedules",
  standalone: true,
  imports: [CommonModule, RouterModule, AvatarComponent, DialogComponent],
  templateUrl: "./my-appointments.component.html",
})
export class MyAppointmentsComponent implements OnInit {
  private appointmentsService = inject(AppointmentsService);
  private router = inject(Router);
  private authService = inject(AuthService); // Inject AuthService

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

  /* methods moved to end of class */

  onImageError(event: Event) {
    const element = event.target as HTMLImageElement;
    if (element) {
      element.src = "/assets/images/placeholder-property.png";
    }
  }

  private toastService = inject(ToastService);

  // Dialog State
  isDialogOpen = signal<boolean>(false);
  selectedAppointment = signal<Appointment | null>(null);

  openManagementDialog(appointment: Appointment) {
    this.selectedAppointment.set(appointment);
    this.isDialogOpen.set(true);
  }

  closeDialog() {
    this.isDialogOpen.set(false);
    this.selectedAppointment.set(null);
  }

  updateStatus(newStatus: AppointmentStatus) {
    const appointment = this.selectedAppointment();
    if (!appointment) return;

    this.appointmentsService.update(appointment._id, { status: newStatus })
      .subscribe({
        next: (updatedApp) => {
          this.toastService.success('Éxito', 'Estado actualizado correctamente');

          this.appointments.update(apps =>
            apps.map(app => app._id === updatedApp._id ? updatedApp : app)
          );
          this.closeDialog();
        },
        error: (err) => {
          console.error("Error actualizando estado:", err);
          this.toastService.error('Error', 'Error al actualizar el estado');
        }
      });
  }

  isAgent(appointment: Appointment): boolean {
    const user = this.authService.currentUser();
    return user?._id === appointment.agent?._id;
  }

  isClient(appointment: Appointment): boolean {
    const user = this.authService.currentUser();
    // Es cliente si su email coincide con el de la cita, Y NO es el agente asignado (para evitar confusion)
    return user?.email === appointment.email && !this.isAgent(appointment);
  }

  getAvailableTransitions(status: AppointmentStatus, isClientUser: boolean = false): AppointmentStatus[] {
    // Definir transiciones validas
    if (isClientUser) {
      // Clientes solo pueden cancelar si no esta ya finalizada
      if ([AppointmentStatus.CANCELLED, AppointmentStatus.COMPLETED].includes(status)) {
        return [];
      }
      return [AppointmentStatus.CANCELLED];
    }

    // Logica de AGENTE
    const transitions: Record<AppointmentStatus, AppointmentStatus[]> = {
      [AppointmentStatus.PENDING]: [AppointmentStatus.CONTACTED, AppointmentStatus.CANCELLED],
      [AppointmentStatus.CONTACTED]: [AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED],
      [AppointmentStatus.COMPLETED]: [],
      [AppointmentStatus.CANCELLED]: [],
    };
    return transitions[status] || [];
  }

  getStatusClass(status: AppointmentStatus): string {
    return this.statusClasses[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  }

  getStatusLabel(status: AppointmentStatus): string {
    return this.statusLabels[status] || status;
  }
}
