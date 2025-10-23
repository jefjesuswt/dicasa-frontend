import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, Validators, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { HotToastService } from '@ngxpert/hot-toast';

import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'auth-login',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private fb = inject(FormBuilder)
  private router = inject(Router)
  private authService = inject(AuthService)
  private toast = inject(HotToastService)
  loading = false;

  constructor() {}

  customToastSuccess() {
    this.toast.success('Login exitoso', {
      duration: 5000,
      style: {
        padding: '16px',
        fontSize: '16px',
      },
    })
  }

  customToastError(error: string) {
    this.toast.error('Error al iniciar sesión', {
      duration: 5000,
      style: {
        padding: '16px',
        fontSize: '16px',
      },
    })
  }

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit() {
    const {email, password} = this.loginForm.value;
    const user = this.authService.login(email, password)
    user.subscribe({
      next: () => {
        this.customToastSuccess();
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.customToastError(error);
      }
    })
    
  }

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }
}
