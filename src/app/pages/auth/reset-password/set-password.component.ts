import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { HotToastService } from '@ngxpert/hot-toast';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-set-password',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './set-password.component.html'
})
export class SetPasswordComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private toast = inject(HotToastService);

  loading = false;
  email: string | null = null;
  code: string | null = null; // Necesitamos el código

  // Validador
  private passwordMatchValidator(g: AbstractControl): ValidationErrors | null {
    const password = g.get('newPassword')?.value;
    const confirmPassword = g.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { 'mismatch': true };
  }

  setPasswordForm = new FormGroup({
    newPassword: new FormControl('', [Validators.required, Validators.minLength(8)]),
    confirmPassword: new FormControl('', [Validators.required])
  }, { validators: (group) => this.passwordMatchValidator(group) });

  ngOnInit(): void {
    // 1. Intenta leer del "Camino B" (Link del email)
    const params = this.route.snapshot.queryParamMap;
    this.email = params.get('email');
    this.code = params.get('code');

    // 2. Si no vienen del link, intenta leer del "Camino A" (Manual)
    if (!this.email) {
      this.email = localStorage.getItem('resetEmail');
    }
    // Para el código, leemos el que verificamos en el paso anterior
    if (!this.code) {
      this.code = sessionStorage.getItem('resetCode');
    }

    // 3. Validación final: ¿Tenemos email y código?
    if (!this.email || !this.code) {
      this.toast.error('Sesión inválida o código no verificado. Por favor, solicita un nuevo código.');
      // Limpiamos por si acaso
      localStorage.removeItem('resetEmail');
      sessionStorage.removeItem('resetCode');
      this.router.navigate(['/auth/forgot-password']);
    }
  }

  get newPassword() { return this.setPasswordForm.get('newPassword'); }
  get confirmPassword() { return this.setPasswordForm.get('confirmPassword'); }

  onSubmit(): void {
    if (this.setPasswordForm.invalid || !this.email || !this.code) {
      this.setPasswordForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const newPassword = this.setPasswordForm.value.newPassword!;

    // --- 👇 LLAMADA A LA API FINAL 👇 ---
    this.authService.resetPassword(this.email, newPassword, this.code)
      .pipe(
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (response) => { // Captura el mensaje de éxito
          // Limpiamos el storage
          localStorage.removeItem('resetEmail');
          sessionStorage.removeItem('resetCode');

          this.toast.success(response.message || '¡Contraseña actualizada! Inicia sesión.');
          this.router.navigate(['/auth/login']);
        },
        error: (errMessage) => { // Captura el mensaje de error
          this.toast.error(errMessage || 'Error al actualizar la contraseña.');
        }
      });
  }
}