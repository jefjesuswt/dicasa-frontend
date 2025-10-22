import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;

  constructor(
    private router: Router
  ) {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)])
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      // Show error message using alert for now
      alert('Por favor completa todos los campos correctamente.');
      return;
    }

    this.loading = true;
    
    // Simulate API call
    setTimeout(() => {
      this.loading = false;
      this.router.navigate(['/']); // Redirect to home after successful login
      // Show success message
    }, 1000);
  }

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }
}
