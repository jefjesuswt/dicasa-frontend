import { Component, Input, OnInit, inject, signal } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from "@angular/forms";
import { CommonModule } from "@angular/common";
import { HttpErrorResponse } from "@angular/common/http";
import { catchError } from "rxjs/operators";
import { EMPTY } from "rxjs";
import { DatePickerModule } from "primeng/datepicker";

import { AppointmentsService } from "../../services/appointment.service";
import { AuthService } from "../../services/auth.service";
import { CreateAppointmentDto } from "../../interfaces/appointments";
import { HotToastService } from "@ngxpert/hot-toast";
import {
  CountryISO,
  NgxIntlTelInputModule,
  PhoneNumberFormat,
  SearchCountryField,
} from "ngx-intl-tel-input";
import parsePhoneNumberFromString from "libphonenumber-js/max";

/**
 * Validador personalizado para restringir el horario.
 * Acepta citas solo entre las 8:00 AM y las 6:00 PM (18:00).
 */
function timeRangeValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;

  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (isNaN(date.getTime())) {
    return { invalidDate: true };
  }

  const hour = date.getHours();
  const minutes = date.getMinutes();

  // Rango de horas permitido (Sistema de 24h)
  const MIN_HOUR = 8; // 8:00 AM
  const MAX_HOUR = 18; // 6:00 PM

  // Lógica de validación:
  // 1. Si la hora es menor a 8 (ej: 7:59 AM) -> Error
  // 2. Si la hora es mayor a 18 (ej: 19:00 PM) -> Error
  // 3. Si son exactamente las 18:xx pero con minutos (ej: 18:30) -> Error (si quieres cerrar a las 6 en punto)
  if (
    hour < MIN_HOUR ||
    hour > MAX_HOUR ||
    (hour === MAX_HOUR && minutes > 0)
  ) {
    return {
      timeRange: true, // Retornamos true o un objeto, el mensaje se maneja en el HTML o getter
    };
  }

  return null;
}

@Component({
  selector: "shared-appointment-form",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DatePickerModule,
    NgxIntlTelInputModule,
  ],
  templateUrl: "./appointment-form.component.html",
})
export class AppointmentFormComponent implements OnInit {
  @Input({ required: true }) propertyId!: string;

  private fb = inject(FormBuilder);
  private appointmentsService = inject(AppointmentsService);
  private authService = inject(AuthService);
  private toast = inject(HotToastService);

  searchCountryField = [SearchCountryField.Iso2, SearchCountryField.Name];
  preferredCountries: CountryISO[] = [
    CountryISO.Venezuela,
    CountryISO.UnitedStates,
  ];
  phoneFormat = PhoneNumberFormat.International;
  CountryISO = CountryISO;

  isSubmitting = signal(false);

  // Variables para controlar el calendario
  minDate!: Date;
  defaultPickerDate!: Date;

  appointmentForm!: FormGroup;
  currentUser = this.authService.currentUser;

  ngOnInit(): void {
    this.initializeDates();
    this.initializeForm();
  }

  /**
   * Calcula la fecha inicial y la fecha mínima seleccionable.
   * - Si es Viernes después de las 6 PM -> Salta al Lunes.
   * - Si es Sábado o Domingo -> Salta al Lunes.
   */
  private initializeDates(): void {
    const now = new Date();
    let targetDate = new Date(now);

    // 1. Ajuste inicial basado en la hora actual
    const currentHour = now.getHours();

    if (currentHour >= 18) {
      // Si ya pasó la hora de cierre (6 PM), pasamos a mañana a las 9 AM
      targetDate.setDate(now.getDate() + 1);
      targetDate.setHours(9, 0, 0, 0);
    } else if (currentHour < 8) {
      // Si es muy temprano (madrugada), fijamos hoy a las 9 AM
      targetDate.setHours(9, 0, 0, 0);
    } else {
      // Si estamos en horario laboral, sugerimos la siguiente hora redonda
      targetDate.setHours(currentHour + 1);
      targetDate.setMinutes(0, 0, 0);

      // Si al redondear nos pasamos de las 18:00, mover a mañana
      if (targetDate.getHours() > 18) {
        targetDate.setDate(targetDate.getDate() + 1);
        targetDate.setHours(9, 0, 0, 0);
      }
    }

    // 2. Salto de Fines de Semana (Sábado=6, Domingo=0)
    // Mientras el día sea sábado o domingo, sumamos un día
    while (targetDate.getDay() === 6 || targetDate.getDay() === 0) {
      targetDate.setDate(targetDate.getDate() + 1);
      targetDate.setHours(9, 0, 0, 0); // Asegurar que empiece a las 9 AM del día hábil
    }

    // 3. Asignar variables
    this.defaultPickerDate = targetDate;

    // La fecha mínima seleccionable será el inicio del día calculado.
    // Esto deshabilita visualmente los días anteriores (incluyendo hoy si ya es viernes noche).
    const minSelectable = new Date(targetDate);
    minSelectable.setHours(0, 0, 0, 0);
    this.minDate = minSelectable;
  }

  private initializeForm(): void {
    const user = this.currentUser();
    let numberToPatch: string | null = null;

    if (user && user.phoneNumber) {
      try {
        const fullCleanNumber = user.phoneNumber.replace(/[\s-]/g, "");
        const phoneNumber = parsePhoneNumberFromString(fullCleanNumber);
        if (phoneNumber && phoneNumber.nationalNumber) {
          numberToPatch = phoneNumber.nationalNumber;
        }
      } catch (error) {
        console.error("Error parsing phone:", error);
        numberToPatch = user.phoneNumber;
      }
    }

    this.appointmentForm = this.fb.group({
      name: [user?.name || "", Validators.required],
      email: [user?.email || "", [Validators.required, Validators.email]],
      phoneNumber: [numberToPatch || null, Validators.required],
      // Inicializamos con defaultPickerDate para evitar el error de "hora actual inválida"
      appointmentDate: [
        this.defaultPickerDate,
        [Validators.required, timeRangeValidator],
      ],
      message: [
        "Hola, estoy interesado/a en esta propiedad y me gustaría agendar una visita.",
        [Validators.required, Validators.minLength(10)],
      ],
    });
  }

  onAppointmentSubmit(): void {
    if (this.appointmentForm.invalid) {
      this.appointmentForm.markAllAsTouched();

      if (this.appointmentForm.get("appointmentDate")?.errors?.["timeRange"]) {
        this.toast.error("El horario debe ser entre 8:00 AM y 6:00 PM.");
      } else {
        this.toast.error("Por favor, revisa todos los campos.");
      }
      return;
    }

    const phoneValue = this.appointmentForm.value.phoneNumber;

    if (typeof phoneValue !== "object" || !phoneValue?.internationalNumber) {
      this.toast.error("El número de teléfono es inválido.");
      this.phoneNumber?.setErrors({ invalidNumber: true });
      this.phoneNumber?.markAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    const dto: CreateAppointmentDto = {
      ...this.appointmentForm.value,
      phoneNumber: phoneValue.internationalNumber,
      propertyId: this.propertyId,
    };

    this.appointmentsService
      .create(dto)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          this.isSubmitting.set(false);
          const errMessage = err?.error?.message || "Error desconocido";

          if (err.status === 409 || errMessage.includes("cita programada")) {
            this.toast.error(
              "El agente no está disponible en ese horario. Intenta otra hora."
            );
          } else {
            this.toast.error(`No se pudo enviar tu solicitud: ${errMessage}`);
          }
          return EMPTY;
        })
      )
      .subscribe(() => {
        this.isSubmitting.set(false);
        this.toast.success(
          "¡Solicitud Enviada! Un agente se pondrá en contacto contigo pronto."
        );
        this.resetAndFillForm();
      });
  }

  private resetAndFillForm(): void {
    // Al resetear, volvemos a poner la fecha sugerida válida
    this.appointmentForm.reset({
      appointmentDate: this.defaultPickerDate,
    });

    const user = this.currentUser();
    let numberToPatch: string | null = null;

    if (user && user.phoneNumber) {
      try {
        const fullCleanNumber = user.phoneNumber.replace(/[\s-]/g, "");
        const phoneNumber = parsePhoneNumberFromString(fullCleanNumber);
        if (phoneNumber && phoneNumber.nationalNumber) {
          numberToPatch = phoneNumber.nationalNumber;
        }
      } catch (error) {}
    }

    this.appointmentForm.patchValue({
      name: user?.name || "",
      email: user?.email || "",
      phoneNumber: numberToPatch,
      message:
        "Hola, estoy interesado/a en esta propiedad y me gustaría agendar una visita.",
    });
  }

  get dateError(): string | null {
    const control = this.appointmentForm.get("appointmentDate");
    if (control?.invalid && (control.dirty || control.touched)) {
      if (control.errors?.["required"]) return "La fecha es requerida.";
      if (control.errors?.["timeRange"]) return "Horario inválido (8am - 6pm).";
      if (control.errors?.["invalidDate"]) return "Fecha inválida.";
    }
    return null;
  }

  get name() {
    return this.appointmentForm.get("name");
  }
  get email() {
    return this.appointmentForm.get("email");
  }
  get phoneNumber() {
    return this.appointmentForm.get("phoneNumber");
  }
}
