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
import { DatePicker } from "primeng/datepicker";

import { AppointmentsService } from "../../services/appointment.service";
import { AuthService } from "../../services/auth.service";
import { CreateAppointmentDto } from "../../interfaces/appointments";
import { HotToastService } from "@ngxpert/hot-toast";
import {
  CountryISO,
  NgxIntlTelInputComponent,
  NgxIntlTelInputModule,
  PhoneNumberFormat,
  SearchCountryField,
} from "ngx-intl-tel-input";
import parsePhoneNumberFromString from "libphonenumber-js/max";

function timeRangeValidator(control: AbstractControl): ValidationErrors | null {
  const date = control.value as Date;

  if (!date) {
    return null;
  }

  const hour = date.getHours();

  const MIN_HOUR = 8;
  const MAX_HOUR = 18;

  if (hour < MIN_HOUR || hour > MAX_HOUR) {
    return {
      timeRange: `El horario debe ser entre las ${MIN_HOUR}:00 y las ${MAX_HOUR}:00.`,
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
    DatePicker,
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

  loading = false;

  isSubmitting = signal(false);
  submitMessage = signal<{ type: "success" | "error"; text: string } | null>(
    null
  );

  today = new Date();
  defaultPickerDate!: Date;

  appointmentForm!: FormGroup;
  currentUser = this.authService.currentUser;

  ngOnInit(): void {
    const user = this.currentUser();

    if (!user) return;
    let numberToPatch = user.phoneNumber;

    if (numberToPatch) {
      try {
        const fullCleanNumber = user.phoneNumber.replace(/[\s-]/g, "");

        const phoneNumber = parsePhoneNumberFromString(fullCleanNumber);

        if (phoneNumber && phoneNumber.nationalNumber) {
          numberToPatch = phoneNumber.nationalNumber;
        }
      } catch (error) {
        console.error("Error al parsear el número en UserForm:", error);
        numberToPatch = user.phoneNumber;
      }
    }

    const nextHour = new Date();
    nextHour.setHours(nextHour.getHours() + 1);
    nextHour.setMinutes(0, 0, 0);
    this.defaultPickerDate = nextHour;

    this.appointmentForm = this.fb.group({
      name: [user?.name || "", Validators.required],
      email: [user?.email || "", [Validators.required, Validators.email]],
      phoneNumber: [numberToPatch || "", Validators.required],
      appointmentDate: [null, [Validators.required, timeRangeValidator]],
      message: [
        "Hola, estoy interesado/a en esta propiedad y me gustaría agendar una visita.",
        [Validators.required, Validators.minLength(10)],
      ],
    });
  }

  onAppointmentSubmit(): void {
    if (this.appointmentForm.invalid) {
      this.appointmentForm.markAllAsTouched();
      return;
    }

    const phoneValue = this.appointmentForm.value.phoneNumber;
    const internationalPhoneNumber = phoneValue?.internationalNumber;

    if (!internationalPhoneNumber) {
      this.loading = false;
      this.toast.error("Número de teléfono inválido.");
      this.phoneNumber?.setErrors({ invalidNumber: true });
      return;
    }

    this.isSubmitting.set(true);
    this.submitMessage.set(null);

    const dto: CreateAppointmentDto = {
      ...this.appointmentForm.value,
      phoneNumber: internationalPhoneNumber,
      propertyId: this.propertyId,
    };

    this.appointmentsService
      .create(dto)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          this.isSubmitting.set(false);

          if (err.status === 409) {
            this.toast.error(
              "El agente ya tiene una cita en ese horario. Por favor, elija otra hora."
            );
          } else {
            this.toast.error(
              "No se pudo enviar tu solicitud. Intenta más tarde."
            );
          }
          return EMPTY;
        })
      )
      .subscribe(() => {
        this.isSubmitting.set(false);
        this.toast.success(
          "¡Solicitud Enviada! Un agente se pondrá en contacto contigo pronto."
        );
        this.appointmentForm.reset();

        const user = this.currentUser();
        this.appointmentForm.patchValue({
          name: user?.name || "",
          email: user?.email || "",
          phoneNumber: user?.phoneNumber || "",
          message:
            "Hola, estoy interesado/a en esta propiedad y me gustaría agendar una visita.",
        });
      });
  }

  get dateError(): string | null {
    const control = this.appointmentForm.get("appointmentDate");
    if (control?.invalid && control.touched) {
      if (control.errors?.["required"]) {
        return "La fecha es requerida.";
      }
      if (control.errors?.["timeRange"]) {
        return control.errors["timeRange"];
      }
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
