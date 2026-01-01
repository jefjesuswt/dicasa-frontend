import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AppointmentFormComponent } from './appointment-form.component';
import { AppointmentsService } from '../../services/appointment.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { User } from '../../interfaces/users';
import { ReactiveFormsModule } from '@angular/forms';
import { signal } from '@angular/core';
import { DatePickerModule } from 'primeng/datepicker';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { CommonModule } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('AppointmentFormComponent', () => {
  let component: AppointmentFormComponent;
  let fixture: ComponentFixture<AppointmentFormComponent>;
  let appointmentsService: jasmine.SpyObj<AppointmentsService>;
  let authService: jasmine.SpyObj<AuthService>;
  let toastService: jasmine.SpyObj<ToastService>;
  let router: jasmine.SpyObj<Router>;

  const mockUser: User = {
    _id: '1',
    name: 'Test User',
    email: 'test@example.com',
    phoneNumber: '+1234567890',
    roles: [],
    isActive: true,
    profileImageUrl: '',
    isEmailVerified: true
  };

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated', 'currentUser']);
    authSpy.currentUser.and.returnValue(mockUser);
    authSpy.isAuthenticated.and.returnValue(true);

    const appsSpy = jasmine.createSpyObj('AppointmentsService', ['create', 'getAgentAvailability']);
    appsSpy.getAgentAvailability.and.returnValue(of([]));
    appsSpy.create.and.returnValue(of({} as any));

    const toastSpy = jasmine.createSpyObj('ToastService', ['success', 'error', 'warning']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        AppointmentFormComponent, // Standalone
        ReactiveFormsModule,
        CommonModule,
        NgxIntlTelInputModule,
        DatePickerModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: AppointmentsService, useValue: appsSpy },
        { provide: ToastService, useValue: toastSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    appointmentsService = TestBed.inject(AppointmentsService) as jasmine.SpyObj<AppointmentsService>;
    toastService = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    fixture = TestBed.createComponent(AppointmentFormComponent);
    component = fixture.componentInstance;
    component.propertyId = 'prop123';

    // Default currentUser signal simulation for the component property initialization
    // The component uses `currentUser = this.authService.currentUser;`
    // We mocked the service getter/property above depending on how it's accessed.
    // In strict testing of signals, we might need a writable signal if we want to change it.
    // However, since it's a computed or signal in the real service, we can mock the specific return value.
    // To support `this.currentUser()` call:
    Object.defineProperty(component, 'currentUser', { value: () => mockUser });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization (Auth State)', () => {
    it('should pre-fill form with user data if authenticated', () => {
      expect(component.appointmentForm.get('name')?.value).toBe(mockUser.name);
      expect(component.appointmentForm.get('email')?.value).toBe(mockUser.email);
    });

    it('should NOT render form if not authenticated (View check simulated)', () => {
        // We simulate unauth by changing the mock return for isAuthenticated check
        authService.isAuthenticated.and.returnValue(false);
        // We need to re-detect changes or check the template logic wrapper if it relies on this method
        expect(component.isAuthenticated).toBeFalse();
    });
  });

  describe('Form Submission', () => {
    it('should call create appointment on valid submit', () => {
        // Setup valid form
        component.appointmentForm.patchValue({
            name: 'John Doe',
            email: 'john@example.com',
            phoneNumber: { internationalNumber: '+1 202-555-0125' }, // Using a potentially valid format or bypassing
            message: 'Interested in property',
            appointmentDate: new Date('2025-01-01T10:00:00')
        });

        // Bypassing strict library validation for unit testing logic
        component.appointmentForm.get('phoneNumber')?.setErrors(null);

        component.onAppointmentSubmit();

        expect(appointmentsService.create).toHaveBeenCalled();
        expect(toastService.success).toHaveBeenCalled();
    });

    it('should NOT call create if form is invalid', () => {
        component.appointmentForm.reset(); // Invalid state
        component.onAppointmentSubmit();
        expect(appointmentsService.create).not.toHaveBeenCalled();
        expect(toastService.error).toHaveBeenCalledWith('Formulario Incompleto', jasmine.any(String));
    });

    it('should handle backend errors gracefully', () => {
        component.appointmentForm.patchValue({
            name: 'John Doe',
            email: 'john@example.com',
            phoneNumber: { internationalNumber: '+1 555-555-5555' },
            message: 'Interested in property check fail',
            appointmentDate: new Date('2025-01-01T10:00:00')
        });

        component.appointmentForm.get('phoneNumber')?.setErrors(null);

        appointmentsService.create.and.returnValue(throwError(() => 'Error Occurred'));

        component.onAppointmentSubmit();

        expect(toastService.error).toHaveBeenCalledWith('No se pudo agendar', 'Error Occurred');
    });
  });

  describe('Navigation', () => {
      it('should navigate to login when goToLogin is called', () => {
          component.goToLogin();
          expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
      });
  });
});
