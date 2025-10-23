import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { finalize } from 'rxjs/operators';
import { RegisterData } from '../../../interfaces/register-data.interace';
import { HotToastService } from '@ngxpert/hot-toast';

// --- 👇 Importa la librería y sus tipos/enums ---
import { NgxIntlTelInputModule, SearchCountryField, CountryISO, PhoneNumberFormat } from 'ngx-intl-tel-input';

@Component({
  selector: 'auth-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    NgxIntlTelInputModule // <-- Asegúrate de que esté aquí
  ],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toast = inject(HotToastService)

  loading = false;
  error: string | null = null;

  // Configuración para ngx-intl-tel-input
  searchCountryField = [SearchCountryField.Iso2, SearchCountryField.Name];
  preferredCountries: CountryISO[] = [CountryISO.Venezuela, CountryISO.UnitedStates];
  phoneFormat = PhoneNumberFormat.International;
  // Añade CountryISO al scope del componente para usarlo en la plantilla si es necesario
  CountryISO = CountryISO; 

  private passwordMatchValidator(g: AbstractControl): ValidationErrors | null {
      const password = g.get('password')?.value;
      const confirmPassword = g.get('confirmPassword')?.value;
      return password === confirmPassword ? null : { 'mismatch': true };
  }

  customToastError(error: string) {
     this.toast.error(error || 'Ocurrió un error', { /* ... estilos ... */ });
  }

  registerForm: FormGroup = this.fb.group({
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', [Validators.required]),
    // El FormControl espera un objeto, validado por la librería
    phoneNumber: new FormControl(undefined, [Validators.required])
  }, { validators: this.passwordMatchValidator.bind(this) }); // Usa bind(this) aquí también

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.toast.error('Por favor, completa todos los campos correctamente.');
      return;
    }

    this.loading = true;
    this.error = null;

    const phoneValue = this.registerForm.value.phoneNumber;
    // Extrae el número internacional del objeto que devuelve la librería
    const internationalPhoneNumber = phoneValue?.internationalNumber || '';

    // Verifica si el número extraído es válido (seguridad extra)
     if (!internationalPhoneNumber) {
        this.loading = false;
        this.toast.error('Número de teléfono inválido.');
        // Marca el control como inválido manualmente si es necesario
        this.registerForm.get('phoneNumber')?.setErrors({ 'invalidNumber': true });
        this.registerForm.get('phoneNumber')?.markAsTouched();
        return;
     }


    const registerData: RegisterData = {
      name: this.registerForm.value.name,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
      phoneNumber: internationalPhoneNumber // Envía el string E.164
    }

    this.authService.register(registerData)
      .pipe(
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: () => {
          this.router.navigate(['/auth/check-email']);
        },
        error: (err) => {
           // err ya debería ser el string del throwError del servicio
           const message = typeof err === 'string' ? err : 'Ocurrió un error al registrarse.';
           this.customToastError(message);
        }
      });
  }

  // Getters
  get name() { return this.registerForm.get('name'); }
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }
  get phoneNumber() { return this.registerForm.get('phoneNumber'); }
}