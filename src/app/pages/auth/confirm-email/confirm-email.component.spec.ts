import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ConfirmEmailComponent } from './confirm-email.component';
import { AuthService } from '../../../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { of, throwError } from 'rxjs';

describe('ConfirmEmailComponent', () => {
  let component: ConfirmEmailComponent;
  let fixture: ComponentFixture<ConfirmEmailComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['confirmEmail']);
    authSpy.confirmEmail.and.returnValue(of(true));

    const routerSpy = jasmine.createSpyObj('Router', ['navigate', 'createUrlTree', 'serializeUrl']);
    Object.defineProperty(routerSpy, 'events', { get: () => of(null) });

    await TestBed.configureTestingModule({
      imports: [ConfirmEmailComponent, CommonModule],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpy },
        {
            provide: ActivatedRoute,
            useValue: {
                snapshot: {
                    queryParamMap: {
                        get: () => 'valid-token'
                    }
                }
            }
        }
      ]
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    fixture = TestBed.createComponent(ConfirmEmailComponent);
    component = fixture.componentInstance;
    // Don't call detectChanges here to verify logic in tests manually or use fakeAsync properly
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call confirmEmail and set status to success on init', () => {
    fixture.detectChanges(); // Trigger ngOnInit
    expect(authService.confirmEmail).toHaveBeenCalledWith('valid-token');
    expect(component.status()).toBe('success');
  });

  it('should navigate to home after success (fakeAsync)', fakeAsync(() => {
    fixture.detectChanges(); // Trigger ngOnInit inside fakeAsync

    expect(authService.confirmEmail).toHaveBeenCalledWith('valid-token');
    expect(component.status()).toBe('success');

    tick(2000);
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  }));
});

describe('ConfirmEmailComponent - Error Case', () => {
    let component: ConfirmEmailComponent;
    let fixture: ComponentFixture<ConfirmEmailComponent>;
    let authService: jasmine.SpyObj<AuthService>;

    beforeEach(async () => {
      const authSpy = jasmine.createSpyObj('AuthService', ['confirmEmail']);
      authSpy.confirmEmail.and.returnValue(throwError(() => 'Invalid Token'));

      const routerSpy = jasmine.createSpyObj('Router', ['navigate', 'createUrlTree', 'serializeUrl']);
      Object.defineProperty(routerSpy, 'events', { get: () => of(null) });

      await TestBed.configureTestingModule({
        imports: [ConfirmEmailComponent, CommonModule],
        providers: [
          { provide: AuthService, useValue: authSpy },
          { provide: Router, useValue: routerSpy },
          {
              provide: ActivatedRoute,
              useValue: {
                  snapshot: {
                      queryParamMap: {
                          get: () => 'invalid-token'
                      }
                  }
              }
          }
        ]
      }).compileComponents();

      authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
      fixture = TestBed.createComponent(ConfirmEmailComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should set error status on failure', () => {
        expect(component.status()).toBe('error');
        expect(component.errorMessage()).toBe('Invalid Token');
    });
  });

describe('ConfirmEmailComponent - Missing Token', () => {
    let component: ConfirmEmailComponent;
    let fixture: ComponentFixture<ConfirmEmailComponent>;

    beforeEach(async () => {
      const authSpy = jasmine.createSpyObj('AuthService', ['confirmEmail']);
      const routerSpy = jasmine.createSpyObj('Router', ['navigate', 'createUrlTree', 'serializeUrl']);
      Object.defineProperty(routerSpy, 'events', { get: () => of(null) });

      await TestBed.configureTestingModule({
        imports: [ConfirmEmailComponent, CommonModule],
        providers: [
          { provide: AuthService, useValue: authSpy },
          { provide: Router, useValue: routerSpy },
          {
              provide: ActivatedRoute,
              useValue: { snapshot: { queryParamMap: { get: () => null } } }
          }
        ]
      }).compileComponents();

      fixture = TestBed.createComponent(ConfirmEmailComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should set error status if token is missing', () => {
        expect(component.status()).toBe('error');
    });
});
