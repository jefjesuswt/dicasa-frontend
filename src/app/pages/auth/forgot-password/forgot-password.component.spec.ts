import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ForgotPasswordComponent } from './forgot-password.component';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { of, throwError } from 'rxjs';

describe('ForgotPasswordComponent', () => {
  let component: ForgotPasswordComponent;
  let fixture: ComponentFixture<ForgotPasswordComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let toastService: jasmine.SpyObj<ToastService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['forgotPassword', 'setTempEmailForFlow']);
    authSpy.forgotPassword.and.returnValue(of({ message: 'Code sent' }));

    const toastSpy = jasmine.createSpyObj('ToastService', ['success', 'error']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate', 'createUrlTree', 'serializeUrl']);
    Object.defineProperty(routerSpy, 'events', { get: () => of(null) });

    await TestBed.configureTestingModule({
      imports: [ForgotPasswordComponent, ReactiveFormsModule, CommonModule],
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

    fixture = TestBed.createComponent(ForgotPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Validation', () => {
    it('should be invalid when empty', () => {
      expect(component.forgotForm.valid).toBeFalse();
    });

    it('should be valid with valid email', () => {
      component.forgotForm.patchValue({ email: 'test@example.com' });
      expect(component.forgotForm.valid).toBeTrue();
    });

    it('should be invalid with invalid email format', () => {
      component.forgotForm.patchValue({ email: 'notanemail' });
      expect(component.forgotForm.valid).toBeFalse();
    });
  });

  describe('Form Submission', () => {
    it('should NOT call service if form is invalid', () => {
      component.forgotForm.patchValue({ email: 'invalid' });
      component.onSubmit();
      expect(authService.forgotPassword).not.toHaveBeenCalled();
    });

    it('should call service and navigate on success', () => {
      component.forgotForm.patchValue({ email: 'test@example.com' });
      component.onSubmit();

      expect(authService.forgotPassword).toHaveBeenCalledWith('test@example.com');
      expect(authService.setTempEmailForFlow).toHaveBeenCalledWith('test@example.com');
      expect(toastService.success).toHaveBeenCalledWith('Código Enviado', 'Code sent');
      expect(router.navigate).toHaveBeenCalledWith(['/auth/verify-code']);
    });

    it('should show error toast on failure', () => {
      component.forgotForm.patchValue({ email: 'test@example.com' });
      authService.forgotPassword.and.returnValue(throwError(() => 'Network error'));

      component.onSubmit();

      expect(authService.forgotPassword).toHaveBeenCalled();
      expect(toastService.error).toHaveBeenCalledWith('Solicitud Fallida', 'Network error');
    });
  });
});
