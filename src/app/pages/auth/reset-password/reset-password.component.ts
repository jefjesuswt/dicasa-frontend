import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterModule, ActivatedRoute } from "@angular/router";
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
  AbstractControl,
  ValidationErrors,
  FormBuilder,
} from "@angular/forms";
import { AuthService } from "../../../services/auth.service";
import { finalize } from "rxjs/operators";
import { ToastService } from "../../../services/toast.service";

@Component({
  selector: "app-set-password",
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: "./reset-password.component.html",
})
export class ResetPasswordComponent implements OnInit {
  // --- Inyección de dependencias ---
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private toast = inject(ToastService); // <-- Inyección correcta
  private fb = inject(FormBuilder); // --- Estado del componente ---

  loading = false;
  email: string | null = null;
  code: string | null = null;

  private passwordMatchValidator(g: AbstractControl): ValidationErrors | null {
    const password = g.get("newPassword")?.value;
    const confirmPassword = g.get("confirmPassword")?.value; // Aseguramos que la longitud mínima sea 8 caracteres para que se active antes el validador
    return password === confirmPassword ? null : { mismatch: true };
  }

  setPasswordForm: FormGroup = this.fb.group(
    {
      newPassword: ["", [Validators.required, Validators.minLength(8)]],
      confirmPassword: ["", [Validators.required]],
    },
    { validators: (group) => this.passwordMatchValidator(group) }
  );

  ngOnInit(): void {
    // Lógica de recuperación de estado (URL o sessionStorage)
    const params = this.route.snapshot.queryParamMap;
    this.email = params.get("email");
    this.code = params.get("code");

    if (!this.email) {
      this.email = this.authService.getTempEmailForFlow();
    }
    if (!this.code) {
      this.code = sessionStorage.getItem("resetCode");
    } // Si no hay email o código, el flujo está roto.

    if (!this.email || !this.code) {
      this.toast.error(
        "Sesión Inválida",
        "Sesión inválida o código no verificado. Solicita uno nuevo."
      );
      this.authService.clearTempEmailForFlow();
      sessionStorage.removeItem("resetCode");
      this.router.navigate(["/auth/forgot-password"]);
    }
  }

  get newPassword() {
    return this.setPasswordForm.get("newPassword");
  }
  get confirmPassword() {
    return this.setPasswordForm.get("confirmPassword");
  }

  onSubmit(): void {
    if (this.setPasswordForm.invalid || !this.email || !this.code) {
      this.setPasswordForm.markAllAsTouched();
      this.toast.error(
        "Formulario Inválido",
        "Verifica que las contraseñas coincidan y cumplan la longitud mínima."
      );
      return;
    }

    this.loading = true;
    const newPassword = this.setPasswordForm.value.newPassword!;

    this.authService
      .resetPassword(this.email, newPassword, this.code)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (response) => {
          this.authService.clearTempEmailForFlow();
          sessionStorage.removeItem("resetCode");

          this.toast.success(
            "Contraseña Actualizada",
            response.message ||
              "Contraseña actualizada con éxito. Por favor, inicia sesión."
          );
          this.router.navigate(["/auth/login"]);
        },
        error: (errMessage) => {
          this.toast.error(
            "Error de Restablecimiento",
            errMessage || "El código es inválido o expiró."
          );
        },
      });
  }
}
