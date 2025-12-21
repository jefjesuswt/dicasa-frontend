import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  ViewChild,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormBuilder,
} from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { AutofillMonitor } from "@angular/cdk/text-field";
import { ToastService } from "../../../services/toast.service";
import { AuthService } from "../../../services/auth.service";
import { finalize } from "rxjs/operators";
import { SeoService } from "../../../services/seo.service";

@Component({
  selector: "auth-login",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: "./login.component.html",
})
export class LoginComponent implements AfterViewInit, OnDestroy {
  @ViewChild("emailInput") emailInput!: ElementRef<HTMLElement>;
  @ViewChild("passwordInput") passInput!: ElementRef<HTMLElement>;

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private seoService = inject(SeoService);
  private toast = inject(ToastService);
  private autofill = inject(AutofillMonitor);

  ngOnInit() {
    this.seoService.updateSeoData(
      "Iniciar Sesión",
      "Accede a tu cuenta de Dicasa Group."
    );
  }

  loading = false;

  loginForm: FormGroup = this.fb.group({
    email: ["", [Validators.required, Validators.email]],
    password: ["", [Validators.required, Validators.minLength(6)]],
    rememberMe: [false],
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
    const { email, password, rememberMe } = this.loginForm.value;

    this.authService
      .login(email, password, rememberMe)
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

  ngAfterViewInit() {
    this.autofill.monitor(this.emailInput).subscribe();
    this.autofill.monitor(this.passInput).subscribe();
  }

  ngOnDestroy() {
    this.autofill.stopMonitoring(this.emailInput);
    this.autofill.stopMonitoring(this.passInput);
  }

  get email() {
    return this.loginForm.get("email");
  }
  get password() {
    return this.loginForm.get("password");
  }
}
