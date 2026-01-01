import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { SeoService } from '../../../services/seo.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { of, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let toastService: jasmine.SpyObj<ToastService>;
  let seoService: jasmine.SpyObj<SeoService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['register', 'setTempEmailForFlow']);
    authSpy.register.and.returnValue(of({} as any));

    const toastSpy = jasmine.createSpyObj('ToastService', ['success', 'error']);
    const seoSpy = jasmine.createSpyObj('SeoService', ['updateSeoData']);

    // Mock Router with extra methods needed by RouterLink
    const routerSpy = jasmine.createSpyObj('Router', ['navigate', 'createUrlTree', 'serializeUrl']);
    Object.defineProperty(routerSpy, 'events', { get: () => of(null) });

    await TestBed.configureTestingModule({
      imports: [
        RegisterComponent,
        ReactiveFormsModule,
        CommonModule,
        NgxIntlTelInputModule,
        NoopAnimationsModule // Required due to NgxIntlTelInput or animations
      ],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: ToastService, useValue: toastSpy },
        { provide: SeoService, useValue: seoSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } }
      ]
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    toastService = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
    seoService = TestBed.inject(SeoService) as jasmine.SpyObj<SeoService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update SEO data on init', () => {
    expect(seoService.updateSeoData).toHaveBeenCalledWith('Registro de Usuario', jasmine.any(String));
  });

  describe('Form Validation', () => {
    it('should be invalid when empty', () => {
      expect(component.registerForm.valid).toBeFalse();
    });

    it('should require matching passwords', () => {
      component.registerForm.patchValue({
        name: 'Test',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'mismatch',
        phoneNumber: { internationalNumber: '+1 555-555-5555' }
      });
      // Bypass phone validation strictly
      component.registerForm.get('phoneNumber')?.setErrors(null);

      expect(component.registerForm.hasError('mismatch')).toBeTrue();
    });

    it('should be valid with correct data', () => {
      component.registerForm.patchValue({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        phoneNumber: { internationalNumber: '+1 555-555-5555' }
      });
      component.registerForm.get('phoneNumber')?.setErrors(null);

      expect(component.registerForm.valid).toBeTrue();
    });
  });

  describe('Form Submission', () => {
    it('should NOT call register if form is invalid', () => {
      component.registerForm.patchValue({ email: '', password: '' });
      component.onSubmit();
      expect(authService.register).not.toHaveBeenCalled();
      expect(toastService.error).toHaveBeenCalledWith('Formulario Inválido', jasmine.any(String));
    });

    it('should call register service and navigate on success', () => {
      component.registerForm.patchValue({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        phoneNumber: { internationalNumber: '+1 202-555-0125' }
      });
      component.registerForm.get('phoneNumber')?.setErrors(null);

      component.onSubmit();

      expect(authService.register).toHaveBeenCalled();
      expect(authService.setTempEmailForFlow).toHaveBeenCalledWith('test@example.com');
      expect(toastService.success).toHaveBeenCalledWith('Registro Exitoso', jasmine.any(String));
      expect(router.navigate).toHaveBeenCalledWith(['/auth/check-email']);
    });

    it('should show error toast on register failure', () => {
      component.registerForm.patchValue({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        phoneNumber: { internationalNumber: '+1 202-555-0125' }
      });
      component.registerForm.get('phoneNumber')?.setErrors(null);

      authService.register.and.returnValue(throwError(() => 'Email in use'));

      component.onSubmit();

      expect(authService.register).toHaveBeenCalled();
      expect(toastService.error).toHaveBeenCalledWith('Registro Fallido', 'Email in use');
    });

    it('should show error if phone number is missing/invalid', () => {
      component.registerForm.patchValue({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        phoneNumber: null // Invalid phone
      });

      // We manually clear errors on other fields to isolate phone check failure logic if we wanted,
      // but form invalid check comes first in logic.
      // The component code checks `registerForm.invalid` first.

      component.onSubmit();
      expect(toastService.error).toHaveBeenCalledWith('Formulario Inválido', jasmine.any(String));

      // Test the explicit phone number check inside onSubmit (post-validity check)
      // Make form valid but phone object missing property (simulated edge case or strict check)
       component.registerForm.patchValue({
        phoneNumber: { someOtherProp: 'invalid' }
      });
      // Force form to be valid to reach the phone logic
      Object.defineProperty(component.registerForm, 'invalid', { get: () => false });

      component.onSubmit();
      expect(toastService.error).toHaveBeenCalledWith('Teléfono Inválido', jasmine.any(String));
    });
  });
});
