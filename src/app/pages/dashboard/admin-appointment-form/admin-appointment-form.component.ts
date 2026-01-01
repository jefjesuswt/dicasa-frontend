import { Component, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { ToastService } from "../../../services/toast.service"; // REPLACED: HotToastService
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

import { CustomDatepickerComponent } from "../../../shared/custom-datepicker/custom-datepicker.component";
import { AppointmentsService } from "../../../services/appointment.service";

type StatusOption = {
  label: string;
  value: AppointmentStatus;
};

@Component({
  selector: "admin-appointment-form",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, CustomDatepickerComponent],
  templateUrl: "./admin-appointment-form.component.html",
})
export class AdminAppointmentFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private appointmentsService = inject(AppointmentsService);
  private usersService = inject(UsersService);
  private toast = inject(ToastService);

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
    { label: "Completada", value: AppointmentStatus.COMPLETED },
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
            this.toast.error("Error", "No se proporcionó ID de la cita para editar.");
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
          this.toast.error("Error", `Error al cargar datos: ${errMessage}`);
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
      agentId: appointment.agent ? appointment.agent._id : null,
    });
  }

  onSubmit(): void {
    if (
      this.appointmentForm.invalid ||
      !this.appointmentId ||
      !this.appointmentData
    ) {
      this.toast.error("Formulario Inválido", "Por favor, revisa los campos del formulario.");
      this.appointmentForm.markAllAsTouched();
      return;
    }

    console.log("--- INICIANDO 'onSubmit' ---");
    this.isSaving = true;
    const formValue = this.appointmentForm.value;
    const saveActions$: Observable<any>[] = [];

    const statusDirty = this.appointmentForm.controls["status"].dirty;
    const dateDirty = this.appointmentForm.controls["appointmentDate"].dirty;

    if (statusDirty || dateDirty) {
      console.log("--- Detectado cambio en Estado o Fecha ---");
      const updateDto: UpdateAppointmentDto = {
        ...(statusDirty && { status: formValue.status }),
        ...(dateDirty && {
          appointmentDate: (formValue.appointmentDate as Date).toISOString(),
        }),
      };
      saveActions$.push(
        this.appointmentsService.update(this.appointmentId, updateDto)
      );
    }

    const agentDirty = this.appointmentForm.controls["agentId"].dirty;
    const originalAgentId = this.appointmentData.agent
      ? this.appointmentData.agent._id
      : null;

    if (agentDirty && formValue.agentId !== originalAgentId) {
      console.log("--- Detectado cambio de Agente ---");
      const reassignDto: ReassignAgentDto = {
        newAgentId: formValue.agentId,
      };
      saveActions$.push(
        this.appointmentsService.reassignAgent(this.appointmentId, reassignDto)
      );
    }

    if (saveActions$.length === 0) {
      this.toast.info("Información", "No se detectaron cambios.");
      this.isSaving = false;
      this.appointmentForm.markAsPristine();
      return;
    }

    concat(...saveActions$)
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe({
        complete: () => {
          this.toast.success("Éxito", "¡Cita actualizada con éxito!");
          this.router.navigate(["/dashboard/appointments"]);
        },
        error: (errMessage) => {
          console.error("Error al guardar:", errMessage);
          this.toast.error("Error", `Error al guardar: ${errMessage}`);
        },
      });
  }

  cancel(): void {
    this.router.navigate(["/dashboard/appointments"]);
  }
}
