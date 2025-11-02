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
import { HotToastService } from "@ngxpert/hot-toast";
import {
  NgxIntlTelInputModule,
  SearchCountryField,
  CountryISO,
  PhoneNumberFormat,
} from "ngx-intl-tel-input";

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
})
export class RegisterComponent {
  // --- Inyección de dependencias ---
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toast = inject(HotToastService);

  // --- Estado del componente ---
  loading = false;

  // --- Configuración de ngx-intl-tel-input ---
  searchCountryField = [SearchCountryField.Iso2, SearchCountryField.Name];
  preferredCountries: CountryISO[] = [
    CountryISO.Venezuela,
    CountryISO.UnitedStates,
  ];
  phoneFormat = PhoneNumberFormat.International;
  CountryISO = CountryISO;

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
      this.toast.error("Por favor, completa todos los campos correctamente.");
      return;
    }

    this.loading = true;

    const phoneValue = this.registerForm.value.phoneNumber;
    const internationalPhoneNumber = phoneValue?.internationalNumber;

    if (!internationalPhoneNumber) {
      this.loading = false;
      this.toast.error("Número de teléfono inválido.");
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
            "¡Registro exitoso! Revisa tu correo para confirmar tu cuenta."
          );
          this.router.navigate(["/auth/check-email"]);
        },
        error: (errMessage) => {
          this.toast.error(errMessage);
        },
      });
  }

  // --- Getters para el formulario ---
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
