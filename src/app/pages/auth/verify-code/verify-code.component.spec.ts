import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { VerifyCodeComponent } from './verify-code.component';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { of, throwError } from 'rxjs';

describe('VerifyCodeComponent', () => {
  let component: VerifyCodeComponent;
  let fixture: ComponentFixture<VerifyCodeComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let toastService: jasmine.SpyObj<ToastService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', [
        'verifyResetCode',
        'forgotPassword',
        'getTempEmailForFlow',
        'clearTempEmailForFlow'
    ]);

    // Default flow: Email exists
    authSpy.getTempEmailForFlow.and.returnValue('test@example.com');
    authSpy.verifyResetCode.and.returnValue(of(true));
    authSpy.forgotPassword.and.returnValue(of({ message: 'Code resent' }));

    const toastSpy = jasmine.createSpyObj('ToastService', ['success', 'error']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate', 'createUrlTree', 'serializeUrl']);
    Object.defineProperty(routerSpy, 'events', { get: () => of(null) });

    await TestBed.configureTestingModule({
      imports: [VerifyCodeComponent, ReactiveFormsModule, CommonModule],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: ToastService, useValue: toastSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } }
      ]
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    toastService = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    fixture = TestBed.createComponent(VerifyCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.obfuscatedEmail).toBe('t***t@example.com');
  });

  it('should redirect if no temp email found', () => {
    authService.getTempEmailForFlow.and.returnValue(null);
    component.ngOnInit(); // Re-run init to catch logic
    expect(toastService.error).toHaveBeenCalledWith('Sesión Inválida', jasmine.any(String));
    expect(router.navigate).toHaveBeenCalledWith(['/auth/forgot-password']);
  });

  describe('Form Validation', () => {
    it('should be invalid when empty or incorrect length', () => {
      expect(component.verifyForm.valid).toBeFalse();

      component.verifyForm.patchValue({ code: '123' });
      expect(component.verifyForm.valid).toBeFalse(); // Min length 6

      component.verifyForm.patchValue({ code: '1234567' });
      expect(component.verifyForm.valid).toBeFalse(); // Max length 6
    });

    it('should be valid with 6 digit code', () => {
      component.verifyForm.patchValue({ code: '123456' });
      expect(component.verifyForm.valid).toBeTrue();
    });
  });

  describe('Verification Submission', () => {
    it('should call verifyResetCode and navigate on success', () => {
      component.verifyForm.patchValue({ code: '123456' });
      component.onSubmit();

      expect(authService.verifyResetCode).toHaveBeenCalledWith('test@example.com', '123456');
      expect(router.navigate).toHaveBeenCalledWith(['/auth/reset-password']);
    });

    it('should show error if code is invalid (backend returns false)', () => {
      authService.verifyResetCode.and.returnValue(of(false));
      component.verifyForm.patchValue({ code: '000000' });
      component.onSubmit();

      expect(toastService.error).toHaveBeenCalledWith('Código Inválido', jasmine.any(String));
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should handle backend errors', () => {
      authService.verifyResetCode.and.returnValue(throwError(() => 'Expired code'));
      component.verifyForm.patchValue({ code: '123456' });
      component.onSubmit();

      expect(toastService.error).toHaveBeenCalledWith('Error de Verificación', 'Expired code');
    });
  });

  describe('Resend Code', () => {
    it('should call forgotPassword to resend code', () => {
      component.resendCode();
      expect(authService.forgotPassword).toHaveBeenCalledWith('test@example.com');
      expect(toastService.success).toHaveBeenCalledWith('Reenvío Exitoso', jasmine.any(String));
    });

    it('should handle resend errors', () => {
      authService.forgotPassword.and.returnValue(throwError(() => 'Limit reached'));
      component.resendCode();
      expect(toastService.error).toHaveBeenCalledWith('Error al Reenviar', 'Limit reached');
    });
  });
});
