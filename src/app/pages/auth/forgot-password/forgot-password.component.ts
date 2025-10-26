import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { HotToastService } from '@ngxpert/hot-toast';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'auth-forgot-password',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './forgot-password.component.html'
})
export class ForgotPasswordComponent {
  private router = inject(Router);
  private authService = inject(AuthService);
  private toast = inject(HotToastService);
  private fb = inject(FormBuilder);

  loading = false;

  forgotForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  get email() { return this.forgotForm.get('email'); }

  onSubmit() {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const email = this.forgotForm.value.email;

    this.authService.forgotPassword(email)
      .pipe(
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (response) => {
          this.authService.setTempEmailForFlow(email);
          this.toast.success(response.message || 'Correo de recuperación enviado.');
          this.router.navigate(['/auth/verify-code']);
        },
        error: (errMessage) => {
          this.toast.error(errMessage);
        }
      });
  }
}
