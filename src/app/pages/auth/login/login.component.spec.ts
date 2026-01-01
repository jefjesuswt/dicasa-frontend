import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { SeoService } from '../../../services/seo.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AutofillMonitor } from '@angular/cdk/text-field';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { of, throwError } from 'rxjs';
import { ElementRef } from '@angular/core';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let toastService: jasmine.SpyObj<ToastService>;
  let seoService: jasmine.SpyObj<SeoService>;
  let router: jasmine.SpyObj<Router>;
  let autofillMonitor: jasmine.SpyObj<AutofillMonitor>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['login']);
    authSpy.login.and.returnValue(of(true)); // Return observable

    const toastSpy = jasmine.createSpyObj('ToastService', ['success', 'error']);
    const seoSpy = jasmine.createSpyObj('SeoService', ['updateSeoData']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate', 'createUrlTree', 'serializeUrl']);
    Object.defineProperty(routerSpy, 'events', { get: () => of(null) }); // Mock events observable

    // AutofillMonitor mocks need to return an observable for monitor()
    const autofillSpy = jasmine.createSpyObj('AutofillMonitor', ['monitor', 'stopMonitoring']);
    autofillSpy.monitor.and.returnValue(of({ isAutofilled: false }));

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule, CommonModule],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: ToastService, useValue: toastSpy },
        { provide: SeoService, useValue: seoSpy },
        { provide: Router, useValue: routerSpy },
        { provide: AutofillMonitor, useValue: autofillSpy },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } }
      ]
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    toastService = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
    seoService = TestBed.inject(SeoService) as jasmine.SpyObj<SeoService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    autofillMonitor = TestBed.inject(AutofillMonitor) as jasmine.SpyObj<AutofillMonitor>;

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;

    // Mock view children manually if needed, or let change detection handle it if template exists
    // Since we are using real component, ViewChild should populate after detectChanges if elements exist
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update SEO data on init', () => {
    expect(seoService.updateSeoData).toHaveBeenCalledWith('Iniciar Sesión', jasmine.any(String));
  });

  describe('Form Validation', () => {
    it('should be invalid when empty', () => {
      expect(component.loginForm.valid).toBeFalse();
    });

    it('should be valid with correct credentials', () => {
      component.loginForm.patchValue({
        email: 'test@example.com',
        password: 'password123'
      });
      expect(component.loginForm.valid).toBeTrue();
    });
  });

  describe('Form Submission', () => {
    it('should NOT call login service if form is invalid', () => {
      component.loginForm.patchValue({ email: '', password: '' });
      component.onSubmit();
      expect(authService.login).not.toHaveBeenCalled();
      expect(toastService.error).toHaveBeenCalledWith('Formulario Inválido', jasmine.any(String));
    });

    it('should call login service and navigate on success', () => {
      component.loginForm.patchValue({
        email: 'test@example.com',
        password: 'password123',
        rememberMe: true
      });

      component.onSubmit();

      expect(authService.login).toHaveBeenCalledWith('test@example.com', 'password123', true);
      expect(toastService.success).toHaveBeenCalledWith('Acceso Autorizado', jasmine.any(String));
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should show error toast on login failure', () => {
      component.loginForm.patchValue({
        email: 'test@example.com',
        password: 'wrongpassword'
      });

      authService.login.and.returnValue(throwError(() => 'Invalid credentials'));

      component.onSubmit();

      expect(authService.login).toHaveBeenCalled();
      expect(toastService.error).toHaveBeenCalledWith('Acceso Denegado', 'Invalid credentials');
    });
  });
});
