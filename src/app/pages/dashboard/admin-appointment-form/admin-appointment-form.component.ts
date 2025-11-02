import { Component, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { HotToastService } from "@ngxpert/hot-toast";
import { finalize, switchMap, tap } from "rxjs/operators";
import { Observable, of, concat } from "rxjs";

import {
  Appointment,
  AppointmentStatus,
} from "../../../interfaces/appointments";
import {
  UpdateAppointmentDto,
  ReassignAgentDto,
} from "../../../interfaces/appointments/appointment-dto.interface";

import { User } from "../../../interfaces/users";
import { UsersService } from "../../../services/users.service";

import { DatePickerModule } from "primeng/datepicker";
import { AppointmentsService } from "../../../services/appointment.service";

type StatusOption = {
  label: string;
  value: AppointmentStatus;
};

@Component({
  selector: "admin-appointment-form",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, DatePickerModule],
  templateUrl: "./admin-appointment-form.component.html",
})
export class AdminAppointmentFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private appointmentsService = inject(AppointmentsService);
  private usersService = inject(UsersService);
  private toast = inject(HotToastService);

  appointmentForm!: FormGroup;

  isEditMode = false;
  appointmentId: string | null = null;
  appointmentData: Appointment | null = null;
  pageTitle = "Cargando...";
  initialLoading = true;
  isSaving = false;

  agents: User[] = [];
  statusOptions: StatusOption[] = [
    { label: "Pendiente", value: AppointmentStatus.PENDING },
    { label: "Contactado", value: AppointmentStatus.CONTACTED },
    { label: "Confirmada", value: AppointmentStatus.CONFIRMED },
    { label: "Cancelada", value: AppointmentStatus.CANCELLED },
  ];

  minDate = new Date();
  defaultPickerDate!: Date;

  ngOnInit(): void {
    this.initializeForm();
    this.setupDefaultDate();

    this.usersService
      .getAgents()
      .pipe(
        tap((agents) => {
          console.log("Agentes cargados:", agents);
          this.agents = agents;
        }),
        switchMap(() => this.route.paramMap),
        switchMap((params) => {
          const id = params.get("id");
          if (id) {
            this.isEditMode = true;
            this.appointmentId = id;
            this.pageTitle = "Editar Cita";
            return this.appointmentsService.findOne(id);
          } else {
            this.isEditMode = false;
            this.pageTitle = "Crear Cita";
            this.toast.error("No se proporcionó ID de la cita para editar.");
            this.router.navigate(["/dashboard/appointments"]);
            return of(null);
          }
        })
      )
      .subscribe({
        next: (appointment) => {
          this.initialLoading = false;
          if (appointment && this.isEditMode) {
            console.log("Cita cargada:", appointment);
            this.appointmentData = appointment;
            this.patchForm(appointment);
            this.appointmentForm.markAsPristine();
          }
        },
        error: (errMessage) => {
          console.error("Error en la cadena de ngOnInit:", errMessage);
          this.initialLoading = false;
          this.toast.error(`Error al cargar datos: ${errMessage}`);
          this.router.navigate(["/dashboard/appointments"]);
        },
      });
  }

  private setupDefaultDate(): void {
    const nextHour = new Date();
    nextHour.setHours(nextHour.getHours() + 1);
    nextHour.setMinutes(0, 0, 0);
    this.defaultPickerDate = nextHour;
  }

  private initializeForm(): void {
    this.appointmentForm = this.fb.group({
      status: ["", Validators.required],
      appointmentDate: [null, [Validators.required]],
      agentId: [null, Validators.required],
    });
  }

  private patchForm(appointment: Appointment): void {
    this.appointmentForm.patchValue({
      status: appointment.status,
      appointmentDate: new Date(appointment.appointmentDate),
      agentId: appointment.agent._id,
    });
  }

  /**
   * ESTE ES EL MÉTODO 'onSubmit' CORREGIDO
   * Solo contiene la lógica de comprobación manual.
   */
  onSubmit(): void {
    if (
      this.appointmentForm.invalid ||
      !this.appointmentId ||
      !this.appointmentData
    ) {
      this.toast.error("Por favor, revisa los campos del formulario.");
      this.appointmentForm.markAllAsTouched();
      return;
    }

    console.log("--- INICIANDO 'onSubmit' ---");
    this.isSaving = true;
    const formValue = this.appointmentForm.value;
    const saveActions$: Observable<any>[] = [];

    // --- INICIO DE LA DEPURACIÓN ---

    // 1. Comprobar ESTADO
    const originalStatus = this.appointmentData.status;
    const newStatus = formValue.status;
    const statusChanged = originalStatus !== newStatus;
    console.log("--- Chequeo de Estado ---");
    console.log(
      `Original: '${originalStatus}' (Tipo: ${typeof originalStatus})`
    );
    console.log(`Nuevo:    '${newStatus}' (Tipo: ${typeof newStatus})`);
    console.log(`¿Cambió?  ${statusChanged}`);

    // 2. Comprobar FECHA
    const originalDate = new Date(
      this.appointmentData.appointmentDate
    ).toISOString();
    const newDate = (formValue.appointmentDate as Date).toISOString();
    const dateChanged = originalDate !== newDate;
    console.log("--- Chequeo de Fecha ---");
    console.log(`Original: '${originalDate}' (Tipo: ${typeof originalDate})`);
    console.log(`Nuevo:    '${newDate}' (Tipo: ${typeof newDate})`);
    console.log(`¿Cambió?  ${dateChanged}`);

    // 3. Comprobar AGENTE
    const originalAgentId = this.appointmentData.agent._id;
    const newAgentId = formValue.agentId;
    const agentChanged = originalAgentId !== newAgentId;
    console.log("--- Chequeo de Agente ---");
    console.log(
      `Original: '${originalAgentId}' (Tipo: ${typeof originalAgentId})`
    );
    console.log(`Nuevo:    '${newAgentId}' (Tipo: ${typeof newAgentId})`);
    console.log(`¿Cambió?  ${agentChanged}`);

    // --- FIN DE LA DEPURACIÓN ---

    if (statusChanged || dateChanged) {
      const updateDto: UpdateAppointmentDto = {
        ...(statusChanged && { status: formValue.status }),
        ...(dateChanged && { appointmentDate: newDate }),
      };
      saveActions$.push(
        this.appointmentsService.update(this.appointmentId, updateDto)
      );
    }

    if (agentChanged) {
      const reassignDto: ReassignAgentDto = {
        newAgentId: formValue.agentId,
      };
      saveActions$.push(
        this.appointmentsService.reassignAgent(this.appointmentId, reassignDto)
      );
    }

    if (saveActions$.length === 0) {
      console.log(
        "--- RESULTADO: No se detectaron cambios. 'saveActions' está vacío. ---"
      );
      this.toast.info("No se detectaron cambios."); // <-- ¿Es este el toast que ves?
      this.isSaving = false;
      this.appointmentForm.markAsPristine();
      return;
    }

    console.log(
      `--- RESULTADO: Ejecutando ${saveActions$.length} acciones... ---`
    );
    concat(...saveActions$)
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe({
        complete: () => {
          this.toast.success("¡Cita actualizada con éxito!");
          this.router.navigate(["/dashboard/appointments"]);
        },
        error: (errMessage) => {
          console.error("Error al guardar:", errMessage);
          this.toast.error(`Error al guardar: ${errMessage}`);
        },
      });
  }

  cancel(): void {
    this.router.navigate(["/dashboard/appointments"]);
  }
}
