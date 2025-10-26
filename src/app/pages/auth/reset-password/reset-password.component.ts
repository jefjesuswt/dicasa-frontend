import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, AbstractControl, ValidationErrors, FormBuilder } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { HotToastService } from '@ngxpert/hot-toast';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-set-password',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './reset-password.component.html'
})
export class ResetPasswordComponent implements OnInit {
  // --- Inyección de dependencias ---
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private toast = inject(HotToastService);
  private fb = inject(FormBuilder);

  // --- Estado del componente ---
  loading = false;
  email: string | null = null;
  code: string | null = null;

  private passwordMatchValidator(g: AbstractControl): ValidationErrors | null {
    const password = g.get('newPassword')?.value;
    const confirmPassword = g.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { 'mismatch': true };
  }

  setPasswordForm: FormGroup = this.fb.group({
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: (group) => this.passwordMatchValidator(group) });

  ngOnInit(): void {
    // Unificamos la lógica para obtener el estado del flujo
    
    // 1. Intentar leer desde los parámetros de la URL (flujo de link de email)
    const params = this.route.snapshot.queryParamMap;
    this.email = params.get('email');
    this.code = params.get('code');

    // 2. Si no vienen en la URL, intentar leer desde el estado del servicio (flujo manual)
    if (!this.email) {
      this.email = this.authService.getTempEmailForFlow();
    }
    if (!this.code) {
      this.code = sessionStorage.getItem('resetCode'); // El código verificado
    }

    // 3. Si no hay email o código, el flujo está roto.
    if (!this.email || !this.code) {
      this.toast.error('Sesión inválida o código no verificado. Por favor, solicita un nuevo código.');
      this.authService.clearTempEmailForFlow();
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

    this.authService.resetPassword(this.email, newPassword, this.code)
      .pipe(
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (response) => {
          // Limpiamos todo el estado temporal del flujo
          this.authService.clearTempEmailForFlow();
          sessionStorage.removeItem('resetCode');

          this.toast.success(response.message || '¡Contraseña actualizada! Inicia sesión.');
          this.router.navigate(['/auth/login']);
        },
        error: (errMessage) => {
          this.toast.error(errMessage);
        }
      });
  }
}
