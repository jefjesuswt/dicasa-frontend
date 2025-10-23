import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

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
  private router = inject(Router)

  forgotForm: FormGroup;
  loading = false;
  error: string | null = null;
  success = false;

  constructor(private authService: AuthService) {
    this.forgotForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email])
    });
  }

  get email() { return this.forgotForm.get('email'); }

  onSubmit() {
    if (this.forgotForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = null;
    const email = this.forgotForm.value.email;

    this.authService.forgotPassword(email)
      .subscribe({
        next: () => {
          this.loading = false;
          this.success = true;
          
          localStorage.setItem('resetEmail', email); 
          
          this.router.navigate(['/auth/verify-code']);
        },
        error: (error) => {
          this.loading = false;
          this.error = error.message || 'Ocurrió un error al procesar tu solicitud. Por favor, inténtalo de nuevo.';
        }
      });
  }
}
