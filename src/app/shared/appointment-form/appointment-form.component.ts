import {
  Component,
  Input,
  OnInit,
  inject,
  signal,
  ViewEncapsulation,
} from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from "@angular/forms";
import { CommonModule } from "@angular/common";
import { catchError, finalize } from "rxjs/operators";
import { EMPTY } from "rxjs";
import { DatePickerModule } from "primeng/datepicker";

import { AppointmentsService } from "../../services/appointment.service";
import { AuthService } from "../../services/auth.service";
import { CreateAppointmentDto } from "../../interfaces/appointments";
import {
  CountryISO,
  NgxIntlTelInputModule,
  PhoneNumberFormat,
  SearchCountryField,
} from "ngx-intl-tel-input";
import parsePhoneNumberFromString from "libphonenumber-js/max";
import { ToastService } from "../../services/toast.service";
import { CustomDatepickerComponent } from "../custom-datepicker/custom-datepicker.component";

function timeRangeValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;

  const date = new Date(value);
  if (isNaN(date.getTime())) return { invalidDate: true };

  const hour = date.getHours();
  const minutes = date.getMinutes();
  const day = date.getDay(); // 0 = Domingo, 6 = Sábado

  // Validar Fin de Semana (Extra check, aunque el datepicker lo bloquee visualmente)
  if (day === 0 || day === 6) {
    return { weekend: true };
  }

  // Validar Horario (8:00 - 18:00)
  const MIN_HOUR = 8;
  const MAX_HOUR = 18;

  if (
    hour < MIN_HOUR ||
    hour > MAX_HOUR ||
    (hour === MAX_HOUR && minutes > 0)
  ) {
    return { timeRange: true };
  }

  return null;
}

@Component({
  selector: "shared-appointment-form",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CustomDatepickerComponent,
    NgxIntlTelInputModule,
  ],
  templateUrl: "./appointment-form.component.html",
  encapsulation: ViewEncapsulation.None, // Necesario para estilar el datepicker interno
  styles: [
    `
      /* --- DATEPICKER ARQUITECTÓNICO --- */

      /* Quitamos bordes y fondos del componente interno de PrimeNG */
      .architectural-datepicker .p-inputtext {
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
        color: white !important;
        font-family: "Courier New", monospace !important;
        font-size: 0.875rem !important; /* text-sm */
        padding: 0.75rem 1rem !important; /* Matches px-4 py-3 of other inputs */
        width: 100%;
      }

      /* Ajuste del placeholder */
      .architectural-datepicker .p-inputtext::placeholder {
        color: #475569 !important; /* slate-600 */
      }

      /* --- NGX-INTL-TEL-INPUT OVERRIDES --- */

      .iti {
        width: 100%;
        display: block;
      }

      .iti__flag-container {
        padding-left: 0.8rem !important; /* Espacio izquierdo */
      }

      /* El input real del teléfono */
      .iti__tel-input {
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
        color: white !important;
        font-family: "Courier New", monospace !important;
        font-size: 1rem !important;
        width: 100%;
        height: 100%;
        padding-left: 5.4rem !important;
      }

      /* Dropdown de países (Ajuste visual para match con Landing) */
      .iti__country-list {
        background-color: #020617 !important; /* slate-950 */
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        backdrop-filter: blur(10px);
        color: #e2e8f0 !important;
        margin-top: 5px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
      }

      .iti__country:hover,
      .iti__country.iti__highlight {
        background-color: rgba(56, 189, 248, 0.1) !important;
        color: #38bdf8 !important;
      }

      /* --- PRIMENG PANEL GLOBAL (Calendario desplegable) --- */
      .p-datepicker {
        background-color: #020617 !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5) !important;
        font-family: sans-serif !important;
      }

      .p-datepicker-header {
        background-color: #0f172a !important;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
        color: white !important;
      }

      .p-datepicker table td > span.p-highlight {
        background-color: #38bdf8 !important; /* sky-400 */
        color: #020617 !important;
        font-weight: bold;
      }

      .p-datepicker table td > span {
        color: #94a3b8 !important;
        width: 2rem;
        height: 2rem;
      }

      .p-timepicker span {
        color: white !important;
      }
    `,
  ],
})
export class AppointmentFormComponent implements OnInit {
  @Input({ required: true }) propertyId!: string;
  @Input() agentId?: string;

  private fb = inject(FormBuilder);
  private appointmentsService = inject(AppointmentsService);
  private authService = inject(AuthService);
  private toast = inject(ToastService);

  searchCountryField = [SearchCountryField.Iso2, SearchCountryField.Name];
  preferredCountries: CountryISO[] = [
    CountryISO.Venezuela,
    CountryISO.UnitedStates,
  ];
  phoneFormat = PhoneNumberFormat.International;
  CountryISO = CountryISO;

  isSubmitting = signal(false);

  minDate!: Date;
  defaultPickerDate!: Date;

  appointmentForm!: FormGroup;
  currentUser = this.authService.currentUser;
  occupiedDates: Date[] = [];

  ngOnInit(): void {
    this.initializeDates();
    this.initializeForm();

    if (this.agentId) {
      this.loadAvailability();
    }
  }

  private loadAvailability(): void {
    if (!this.agentId) return;

    this.appointmentsService
      .getAgentAvailability(this.agentId)
      .subscribe((dates) => {
        this.occupiedDates = dates;
      });
  }

  private initializeDates(): void {
    const now = new Date();
    let targetDate = new Date(now);

    const currentHour = now.getHours();

    // Lógica inteligente para sugerir hora
    if (currentHour >= 18) {
      targetDate.setDate(now.getDate() + 1);
      targetDate.setHours(9, 0, 0, 0);
    } else if (currentHour < 8) {
      targetDate.setHours(9, 0, 0, 0);
    } else {
      targetDate.setHours(currentHour + 1);
      targetDate.setMinutes(0, 0, 0);
      if (targetDate.getHours() > 18) {
        targetDate.setDate(targetDate.getDate() + 1);
        targetDate.setHours(9, 0, 0, 0);
      }
    }

    // Saltar fines de semana
    while (targetDate.getDay() === 6 || targetDate.getDay() === 0) {
      targetDate.setDate(targetDate.getDate() + 1);
      targetDate.setHours(9, 0, 0, 0);
    }

    this.defaultPickerDate = targetDate;

    // Min date = hoy (incluso si ya pasó la hora, para permitir ver el calendario,
    // aunque el validador y la lógica inicial protegen)
    const minSelectable = new Date();
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

      const dateErrors = this.appointmentForm.get("appointmentDate")?.errors;
      if (dateErrors?.["timeRange"]) {
        this.toast.warning(
          "Horario Inválido",
          "Nuestras oficinas trabajan de 8:00 AM a 6:00 PM."
        );
      } else if (dateErrors?.["weekend"]) {
        this.toast.warning(
          "Fines de Semana",
          "Nuestras oficinas administrativas no laboran sábados ni domingos."
        );
      } else {
        this.toast.error(
          "Formulario Incompleto",
          "Por favor verifica los campos marcados en rojo."
        );
      }
      return;
    }

    const phoneValue = this.appointmentForm.value.phoneNumber;

    if (typeof phoneValue !== "object" || !phoneValue?.internationalNumber) {
      this.toast.error(
        "Teléfono Inválido",
        "Por favor ingresa un número de teléfono válido."
      );
      this.phoneNumber?.setErrors({ invalidNumber: true });
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
        catchError((errorMessage: string) => {
          const isScheduleConflict =
            errorMessage.toLowerCase().includes("horario") ||
            errorMessage.toLowerCase().includes("choca") ||
            errorMessage.toLowerCase().includes("ocupado");

          if (isScheduleConflict) {
            this.toast.warning(
              "Horario No Disponible",
              errorMessage // Pasamos el mensaje exacto del backend
            );
          } else {
            this.toast.error("No se pudo agendar", errorMessage);
          }
          return EMPTY;
        }),
        finalize(() => {
          this.isSubmitting.set(false);
        })
      )
      .subscribe(() => {
        this.isSubmitting.set(false);
        this.toast.success(
          "Solicitud Enviada",
          "Tu cita ha sido agendada correctamente. Te contactaremos pronto."
        );
        this.resetAndFillForm();
      });
  }

  private resetAndFillForm(): void {
    this.appointmentForm.reset({
      appointmentDate: this.defaultPickerDate,
    });

    // Re-popular datos del usuario si sigue logueado
    const user = this.currentUser();
    // ... lógica de repopular (simplificada) ...
    if (user) {
      this.appointmentForm.patchValue({ name: user.name, email: user.email });
    }
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
  get message() {
    return this.appointmentForm.get("message");
  }
  get appointmentDate() {
    return this.appointmentForm.get("appointmentDate");
  }
}
