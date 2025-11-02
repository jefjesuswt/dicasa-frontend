import { Component, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterModule } from "@angular/router";
import { finalize } from "rxjs";
import { HotToastService } from "@ngxpert/hot-toast";

import {
  Appointment,
  AppointmentStatus,
} from "../../../interfaces/appointments";
import { DialogComponent } from "../../../shared/dialog/dialog.component";

import { QueryAppointmentParams } from "../../../interfaces/appointments/query-appointment.interface";
import { PaginatedAppointmentResponse } from "../../../interfaces/appointments/paginated-appointment-response.interface";
import { AppointmentsService } from "../../../services/appointment.service";
import {
  DropdownOption,
  SearchBarComponent,
  SearchParams,
} from "../../../shared/search-bar/search-bar.component";
import { DashboardAppointmentCardComponent } from "../../../components/dashboard/dashboard-appointment-card/dashboard-appointment-card.component";

@Component({
  selector: "dashboard-appointment-list",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    DialogComponent,
    SearchBarComponent,
    DashboardAppointmentCardComponent,
  ],
  templateUrl: "./admin-appointment-list.component.html",
})
export class AdminAppointmentListComponent implements OnInit {
  private appointmentsService = inject(AppointmentsService);
  private router = inject(Router);
  private toast = inject(HotToastService);

  public appointments: Appointment[] = [];
  public loading = true;
  public error: string | null = null;
  public Math = Math;

  public totalAppointments = 0;
  public currentPage = 1;
  public rowsPerPage = 10;
  public currentQueryParams: QueryAppointmentParams = {};

  public isDeleteDialogOpen = false;
  public appointmentToCancel: Appointment | null = null;
  public isDeleting = false;

  statusSeverity: Record<AppointmentStatus, string> = {
    [AppointmentStatus.PENDING]: "bg-yellow-100 text-yellow-800",
    [AppointmentStatus.CONTACTED]: "bg-blue-100 text-blue-800",
    [AppointmentStatus.CONFIRMED]: "bg-green-100 text-green-800",
    [AppointmentStatus.CANCELLED]: "bg-red-100 text-red-800",
  };
  statusLabels: Record<AppointmentStatus, string> = {
    [AppointmentStatus.PENDING]: "Pendiente",
    [AppointmentStatus.CONTACTED]: "Contactado",
    [AppointmentStatus.CONFIRMED]: "Confirmada",
    [AppointmentStatus.CANCELLED]: "Cancelada",
  };

  public statusOptions: DropdownOption[] = [
    { value: AppointmentStatus.PENDING, label: "Pendiente" },
    { value: AppointmentStatus.CONTACTED, label: "Contactado" },
    { value: AppointmentStatus.CONFIRMED, label: "Confirmada" },
    { value: AppointmentStatus.CANCELLED, label: "Cancelada" },
  ];

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    const params: QueryAppointmentParams = {
      ...this.currentQueryParams,
      page: this.currentPage,
      limit: this.rowsPerPage,
    };

    this.loading = true;
    this.error = null;
    this.appointmentsService
      .getAppointments(params)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (response: PaginatedAppointmentResponse) => {
          this.appointments = response.data;
          this.totalAppointments = response.total;
        },
        error: (errMessage) => {
          this.error = `Error al cargar citas: ${errMessage}`;
        },
      });
  }

  onAppointmentSearch(params: SearchParams) {
    this.currentQueryParams = {
      search: params.query,
      status:
        params.selectedValue === "all"
          ? undefined
          : (params.selectedValue as AppointmentStatus),
    };
    this.currentPage = 1;
    this.loadAppointments();
  }

  onPageChange(page: number) {
    const totalPages = Math.ceil(this.totalAppointments / this.rowsPerPage);
    if (page < 1 || page > totalPages || page === this.currentPage) {
      return;
    }
    this.currentPage = page;
    this.loadAppointments();
  }

  getStatusBadgeClass(status: AppointmentStatus): string {
    return this.statusSeverity[status] || "bg-gray-100 text-gray-800";
  }

  getStatusLabel(status: AppointmentStatus): string {
    return this.statusLabels[status] || status;
  }

  editAppointment(app: Appointment) {
    this.router.navigate(["/dashboard/appointments/edit", app._id]);
  }

  openDeleteDialog(app: Appointment): void {
    this.appointmentToCancel = app;
    this.isDeleteDialogOpen = true;
  }

  closeDeleteDialog(): void {
    this.isDeleteDialogOpen = false;
    this.appointmentToCancel = null;
    this.isDeleting = false;
  }

  confirmDelete(): void {
    if (!this.appointmentToCancel) return;

    this.isDeleting = true;
    this.appointmentsService
      .remove(this.appointmentToCancel._id)
      .pipe(finalize(() => (this.isDeleting = false)))
      .subscribe({
        next: () => {
          this.toast.success("Cita eliminada con éxito.");
          this.closeDeleteDialog();
          this.loadAppointments();
        },
        error: (errMessage) => {
          this.toast.error(`Error al eliminar la cita: ${errMessage}`);
          this.isDeleting = false;
        },
      });
  }
}
