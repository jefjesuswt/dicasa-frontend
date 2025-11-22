import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterModule } from "@angular/router";
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
} from "@angular/forms";
import { AuthService } from "../../../services/auth.service";
import { finalize } from "rxjs/operators";
import { ToastService } from "../../../services/toast.service";

@Component({
  selector: "app-verify-code",
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: "./verify-code.component.html",
})
export class VerifyCodeComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  loading = false;
  resending = false;
  email: string | null = null;
  public obfuscatedEmail = "";

  verifyForm: FormGroup = this.fb.group({
    code: [
      "",
      [Validators.required, Validators.minLength(6), Validators.maxLength(6)],
    ],
  });

  ngOnInit(): void {
    this.email = this.authService.getTempEmailForFlow();
    if (!this.email) {
      this.toast.error(
        "Sesión Inválida",
        "Sesión de reseteo inválida. Por favor, empieza de nuevo."
      );
      this.router.navigate(["/auth/forgot-password"]);
      return;
    }
    const [user, domain] = this.email.split("@");
    const protectedUser =
      user.length > 3
        ? `${user.substring(0, 1)}***${user.substring(user.length - 1)}`
        : user;
    this.obfuscatedEmail = `${protectedUser}@${domain}`;
  }

  get code() {
    return this.verifyForm.get("code");
  }

  onSubmit(): void {
    if (this.verifyForm.invalid || !this.email) {
      this.verifyForm.markAllAsTouched();
      this.toast.error("Código Inválido", "El código debe tener 6 dígitos.");
      return;
    }

    this.loading = true;
    const code = this.verifyForm.value.code!;

    this.authService
      .verifyResetCode(this.email, code)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (isValid) => {
          if (isValid) {
            sessionStorage.setItem("resetCode", code);
            this.router.navigate(["/auth/reset-password"]);
          } else {
            this.toast.error(
              "Código Inválido",
              "El código no coincide o ha expirado."
            );
          }
        },
        error: (errMessage) => {
          this.toast.error(
            "Error de Verificación",
            errMessage || "Código incorrecto. Vuelve a intentarlo."
          );
        },
      });
  }

  resendCode(): void {
    if (!this.email || this.resending) {
      return;
    }
    this.resending = true;
    this.authService
      .forgotPassword(this.email)
      .pipe(finalize(() => (this.resending = false)))
      .subscribe({
        next: (response) => {
          this.toast.success(
            "Reenvío Exitoso",
            response.message || "Se ha reenviado un nuevo código."
          );
        },
        error: (errMessage) => {
          this.toast.error(
            "Error al Reenviar",
            errMessage || "No se pudo reenviar el código."
          );
        },
      });
  }
}
