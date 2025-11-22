import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  ValidationErrors,
} from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { AuthService } from "../../../services/auth.service";
import { finalize } from "rxjs/operators";
import { RegisterData } from "../../../interfaces/users/register-data.interace";
import {
  NgxIntlTelInputModule,
  SearchCountryField,
  CountryISO,
  PhoneNumberFormat,
} from "ngx-intl-tel-input";
import { ToastService } from "../../../services/toast.service";
import { SeoService } from "../../../services/seo.service";

@Component({
  selector: "auth-register",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    NgxIntlTelInputModule,
  ],
  templateUrl: "./register.component.html",
  styles: [
    `
      .iti {
        width: 100%;
        display: block;
      }
      .iti__flag-container {
        padding-left: 0.8rem !important;
      }
      .iti__tel-input {
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
        color: white !important;
        font-family: "Courier New", monospace !important;
        font-size: 0.875rem !important;
        width: 100%;
        height: 100%;
        padding-top: 0.75rem !important;
        padding-bottom: 0.75rem !important;
        padding-left: 6.5rem !important;
      }
      .iti__country-list {
        background-color: #020617 !important;
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
      .iti__arrow {
        border-top-color: #94a3b8 !important;
      }
      .iti__arrow.iti__arrow--up {
        border-bottom-color: #38bdf8 !important;
      }
    `,
  ],
})
export class RegisterComponent {
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toast = inject(ToastService);
  private seoService = inject(SeoService); // Inyectar

  loading = false;

  searchCountryField = [SearchCountryField.Iso2, SearchCountryField.Name];
  preferredCountries: CountryISO[] = [
    CountryISO.Venezuela,
    CountryISO.UnitedStates,
  ];
  phoneFormat = PhoneNumberFormat.International;
  CountryISO = CountryISO;

  ngOnInit() {
    this.seoService.updateSeoData(
      "Registro de Usuario",
      "Crea tu cuenta en Dicasa Group para gestionar tus propiedades y citas."
    );
  }

  private passwordMatchValidator(g: AbstractControl): ValidationErrors | null {
    const password = g.get("password")?.value;
    const confirmPassword = g.get("confirmPassword")?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  registerForm: FormGroup = this.fb.group(
    {
      name: ["", [Validators.required]],
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(6)]],
      confirmPassword: ["", [Validators.required]],
      phoneNumber: [null, [Validators.required]],
    },
    { validators: this.passwordMatchValidator.bind(this) }
  );

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.toast.error(
        "Formulario Inválido",
        "Por favor, completa todos los campos correctamente."
      );
      return;
    }

    this.loading = true;

    const phoneValue = this.registerForm.value.phoneNumber;
    const internationalPhoneNumber = phoneValue?.internationalNumber;

    if (!internationalPhoneNumber) {
      this.loading = false;
      this.toast.error("Teléfono Inválido", "Número de teléfono inválido.");
      this.phoneNumber?.setErrors({ invalidNumber: true });
      return;
    }

    const registerData: RegisterData = {
      name: this.registerForm.value.name,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
      phoneNumber: internationalPhoneNumber,
    };

    this.authService
      .register(registerData)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: () => {
          this.authService.setTempEmailForFlow(registerData.email);
          this.toast.success(
            "Registro Exitoso",
            "Revisa tu correo para confirmar tu cuenta y acceder."
          );
          this.router.navigate(["/auth/check-email"]);
        },
        error: (errMessage) => {
          this.toast.error(
            "Registro Fallido",
            errMessage || "Ocurrió un error al crear la cuenta."
          );
        },
      });
  } // --- Getters para el formulario ---

  get name() {
    return this.registerForm.get("name");
  }
  get email() {
    return this.registerForm.get("email");
  }
  get password() {
    return this.registerForm.get("password");
  }
  get confirmPassword() {
    return this.registerForm.get("confirmPassword");
  }
  get phoneNumber() {
    return this.registerForm.get("phoneNumber");
  }
}
