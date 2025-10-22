import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;

  constructor(
    private router: Router
  ) {
    this.registerForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      confirmPassword: new FormControl('', [Validators.required])
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: AbstractControl) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { 'mismatch': true };
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;
    
    // Simulate API call
    setTimeout(() => {
      this.loading = false;
      this.router.navigate(['/']);
    }, 1000);
  }

  get name() { return this.registerForm.get('name'); }
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }
}
