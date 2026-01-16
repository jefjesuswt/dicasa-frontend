import { Component, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { finalize } from "rxjs";
import { ToastService } from "../../../services/toast.service"; // REPLACED: HotToastService

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
import { ToggleSwitch } from "primeng/toggleswitch";

@Component({
  selector: "dashboard-appointment-list",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    DialogComponent,
    SearchBarComponent,
    DashboardAppointmentCardComponent,
    ToggleSwitch,
  ],
  templateUrl: "./admin-appointment-list.component.html",
})
export class AdminAppointmentListComponent implements OnInit {
  private appointmentsService = inject(AppointmentsService);
  private router = inject(Router);
  private toast = inject(ToastService);

  public appointments: Appointment[] = [];
  public loading = true;
  public isInitialLoad = true;
  public error: string | null = null;
  public Math = Math;
  public showDeleted = false;

  public totalAppointments = 0;
  public currentPage = 1;
  public rowsPerPage = 10;
  public sortBy = "appointmentDate";
  public sortOrder: "asc" | "desc" = "desc";
  public currentQueryParams: QueryAppointmentParams = {};

  public sortOptions = [
    { label: "Fecha: Más Próximas", value: "appointmentDate", order: "desc" },
    { label: "Fecha: Más Lejanas", value: "appointmentDate", order: "asc" },
    { label: "Propiedad (A-Z)", value: "property", order: "asc" },
    { label: "Agente (A-Z)", value: "agent", order: "asc" },
    { label: "Cliente (A-Z)", value: "name", order: "asc" },
    { label: "Contacto (A-Z)", value: "email", order: "asc" },
    { label: "Estado (A-Z)", value: "status", order: "asc" },
  ];

  public isDeleteDialogOpen = false;
  public appointmentToCancel: Appointment | null = null;
  public isDeleting = false;

  statusSeverity: Record<AppointmentStatus, string> = {
    [AppointmentStatus.PENDING]: "text-amber-500",
    [AppointmentStatus.CONTACTED]: "text-sky-500",
    [AppointmentStatus.COMPLETED]: "text-emerald-500",
    [AppointmentStatus.CANCELLED]: "text-red-500",
  };
  statusLabels: Record<AppointmentStatus, string> = {
    [AppointmentStatus.PENDING]: "Pendiente",
    [AppointmentStatus.CONTACTED]: "Contactado",
    [AppointmentStatus.COMPLETED]: "Completada",
    [AppointmentStatus.CANCELLED]: "Cancelada",
  };

  public statusOptions: DropdownOption[] = [
    { value: AppointmentStatus.PENDING, label: "Pendiente" },
    { value: AppointmentStatus.CONTACTED, label: "Contactado" },
    { value: AppointmentStatus.COMPLETED, label: "Completada" },
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
      sortBy: this.sortBy,
      sortOrder: this.sortOrder,
      includeDeleted: this.showDeleted ? true : undefined,
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
          this.isInitialLoad = false;
        },
        error: (errMessage) => {
          this.error = `Error al cargar citas: ${errMessage}`;
          this.isInitialLoad = false;
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
    this.sortBy = params.sortBy || "appointmentDate";
    this.sortOrder = params.sortOrder || "desc";
    this.currentPage = 1;
    this.loadAppointments();
  }

  toggleSort(column: string) {
    if (this.sortBy === column) {
      this.sortOrder = this.sortOrder === "asc" ? "desc" : "asc";
    } else {
      this.sortBy = column;
      this.sortOrder = "asc";
    }
    this.currentPage = 1;
    this.loadAppointments();
  }

  onDeletedToggleChange(): void {
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
    return this.statusSeverity[status] || "text-[var(--text-secondary)]";
  }

  getStatusLabel(status: AppointmentStatus): string {
    return this.statusLabels[status] || status;
  }

  editAppointment(app: Appointment) {
    if (!app.property) return;
    this.router.navigate(["/dashboard/appointments/edit", app._id]);
  }

  openDeleteDialog(app: Appointment): void {
    console.log("Opening delete dialog for:", app);
    this.appointmentToCancel = app;
    this.isDeleteDialogOpen = true;
  }

  closeDeleteDialog(): void {
    console.log("Closing delete dialog");
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
          this.toast.success("Correcto", "Cita eliminada con éxito.");
          this.closeDeleteDialog();
          this.loadAppointments();
        },
        error: (errMessage) => {
          this.toast.error("Error", `Error al eliminar la cita: ${errMessage}`);
          this.isDeleting = false;
        },
      });
  }
}
