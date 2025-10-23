import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { HotToastService } from '@ngxpert/hot-toast';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-verify-code',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './verify-code.component.html'
})
export class VerifyCodeComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  private toast = inject(HotToastService);

  loading = false;
  resending = false; // Estado para el botón de reenviar
  email: string | null = null;

  verifyForm = new FormGroup({
    code: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(6)])
  });

  ngOnInit(): void {
    this.email = localStorage.getItem('resetEmail');
    if (!this.email) {
      this.toast.error('Sesión de reseteo inválida. Por favor, empieza de nuevo.');
      this.router.navigate(['/auth/forgot-password']);
    }
  }

  get code() { return this.verifyForm.get('code'); }

  onSubmit(): void {
    if (this.verifyForm.invalid || !this.email) {
      this.verifyForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const code = this.verifyForm.value.code!;

    // --- 👇 LLAMADA A LA NUEVA API 👇 ---
    this.authService.verifyResetCode(this.email, code)
      .pipe(
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (isValid) => {
          if (isValid) {
            // Guardamos el código verificado en sessionStorage para el siguiente paso
            sessionStorage.setItem('resetCode', code);
            // Redirigimos al Paso 3
            this.router.navigate(['/auth/set-password']);
          } else {
             // Esto no debería ocurrir si el backend lanza error, pero por si acaso
             this.toast.error('Código inválido o expirado.');
          }
        },
        error: (errMessage) => { // Capturamos el mensaje de error del throwError
          this.toast.error(errMessage);
        }
      });
  }

  // --- 👇 MÉTODO PARA REENVIAR CÓDIGO 👇 ---
  resendCode(): void {
    if (!this.email || this.resending) {
      return;
    }
    this.resending = true;
    // Asumiendo que tienes un método 'forgotPassword' en tu servicio
    // que simplemente reenvía el email si el usuario ya existe.
    this.authService.forgotPassword(this.email)
      .pipe(finalize(() => this.resending = false))
      .subscribe({
        next: () => {
          this.toast.success('Se ha reenviado el código a tu correo.');
        },
        error: (err) => {
          this.toast.error(err.message || 'Error al reenviar el código.');
        }
      });
  }
}