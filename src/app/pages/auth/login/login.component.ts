import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormBuilder,
} from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { ToastService } from "../../../services/toast.service";
import { AuthService } from "../../../services/auth.service";
import { finalize } from "rxjs/operators";

@Component({
  selector: "auth-login",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: "./login.component.html",
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private toast = inject(ToastService);

  loading = false;

  loginForm: FormGroup = this.fb.group({
    email: ["", [Validators.required, Validators.email]],
    password: ["", [Validators.required, Validators.minLength(6)]],
  });

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.toast.error(
        "Formulario Inválido",
        "Por favor verifica tus credenciales."
      );
      return;
    }
    this.loading = true;
    const { email, password } = this.loginForm.value;

    this.authService
      .login(email, password)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: () => {
          this.toast.success(
            "Acceso Autorizado",
            "Bienvenido al panel de gestión."
          );
          this.router.navigate(["/"]);
        },
        error: (errMessage) => {
          // Usar tu ToastService con título y mensaje
          this.toast.error(
            "Acceso Denegado",
            errMessage || "Usuario o contraseña incorrectos."
          );
        },
      });
  }

  get email() {
    return this.loginForm.get("email");
  }
  get password() {
    return this.loginForm.get("password");
  }
}
