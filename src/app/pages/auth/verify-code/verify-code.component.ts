import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
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
  // --- Inyección de dependencias ---
  private router = inject(Router);
  private authService = inject(AuthService);
  private toast = inject(HotToastService);
  private fb = inject(FormBuilder);

  // --- Estado del componente ---
  loading = false;
  resending = false;
  email: string | null = null;
  
  // Ocultamos parte del email para mostrarlo en la UI
  public obfuscatedEmail = '';

  verifyForm: FormGroup = this.fb.group({
    code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
  });

  ngOnInit(): void {
    // La única fuente de verdad es el servicio
    this.email = this.authService.getTempEmailForFlow();
    
    if (!this.email) {
      this.toast.error('Sesión de reseteo inválida. Por favor, empieza de nuevo.');
      this.router.navigate(['/auth/forgot-password']);
      return;
    }
    
    // Creamos una versión ofuscada del email para la UI
    const [user, domain] = this.email.split('@');
    this.obfuscatedEmail = `${user.substring(0, 3)}...${user.substring(user.length - 2)}@${domain}`;
  }

  get code() { return this.verifyForm.get('code'); }

  onSubmit(): void {
    if (this.verifyForm.invalid || !this.email) {
      this.verifyForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const code = this.verifyForm.value.code!;

    this.authService.verifyResetCode(this.email, code)
      .pipe(
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (isValid) => {
          if (isValid) {
            // Guardamos el código verificado para el siguiente paso
            sessionStorage.setItem('resetCode', code);
            // Mantenemos el email en el authService y navegamos
            this.router.navigate(['/auth/set-password']);
          } else {
             // Esto es por si acaso, ya que el servicio debería arrojar un error
             this.toast.error('Código inválido o expirado.');
          }
        },
        error: (errMessage) => {
          this.toast.error(errMessage);
        }
      });
  }

  resendCode(): void {
    if (!this.email || this.resending) {
      return;
    }
    
    this.resending = true;
    this.authService.forgotPassword(this.email)
      .pipe(
        finalize(() => this.resending = false)
      )
      .subscribe({
        next: (response) => {
          this.toast.success(response.message || 'Se ha reenviado el código a tu correo.');
        },
        error: (errMessage) => {
          this.toast.error(errMessage);
        }
      });
  }
}
