import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { AuthStatus } from '../enums/auth-status.enum';
import { UserRole } from '../interfaces/users/roles.enum';
import { User } from '../interfaces/users';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockUser: User = {
    _id: '123',
    name: 'Test User',
    email: 'test@example.com',
    roles: [UserRole.USER],
    isActive: true,
    profileImageUrl: '',
    isEmailVerified: true,
    phoneNumber: '',
  };

  const mockAdminUser: User = {
    ...mockUser,
    roles: [UserRole.ADMIN],
  };

  const mockManagerUser: User = {
    ...mockUser,
    roles: [UserRole.MANAGER],
  };

  const mockAgentUser: User = {
    ...mockUser,
    roles: [UserRole.AGENT],
  };

  const mockAuthResponse = {
    user: mockUser,
    token: {
        accessToken: 'fake-access-token',
        refreshToken: 'fake-refresh-token'
    }
  };

  beforeEach(() => {
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: routerSpyObj }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Role Checks', () => {
    it('should return false for isAdmin if user is USER', () => {
      service.setCurrentUser(mockAuthResponse);
      expect(service.isAdmin()).toBeFalse();
    });

    it('should return true for isAdmin if user is ADMIN', () => {
      service.setCurrentUser({ ...mockAuthResponse, user: mockAdminUser });
      expect(service.isAdmin()).toBeTrue();
    });

    it('should return true for isManager if user is MANAGER', () => {
       service.setCurrentUser({ ...mockAuthResponse, user: mockManagerUser });
      expect(service.isManager()).toBeTrue();
    });

     it('should return true for isAgent if user is AGENT', () => {
       service.setCurrentUser({ ...mockAuthResponse, user: mockAgentUser });
      expect(service.isAgent()).toBeTrue();
    });
  });

  describe('Login', () => {
    it('should login and set current user and token in localStorage by default', () => {
      const email = 'test@example.com';
      const password = 'password';

      service.login(email, password, true).subscribe(result => {
        expect(result).toBeTrue();
        expect(service.currentUser()).toEqual(mockUser);
        expect(service.isAuthenticated()).toBeTrue();
        expect(localStorage.getItem('accessToken')).toBe('fake-access-token');
      });

      const req = httpMock.expectOne(`${environment.API_URL}/auth/login`);
      expect(req.request.method).toBe('POST');
      req.flush(mockAuthResponse);
    });
  });

  describe('Logout', () => {
    it('should clear auth data and navigate to login', () => {
        // Setup initial state
        service.setCurrentUser(mockAuthResponse);
        expect(service.isAuthenticated()).toBeTrue();

        service.logout();

        expect(service.currentUser()).toBeNull();
        expect(service.authStatus()).toBe(AuthStatus.unauthenticated);
        expect(localStorage.getItem('accessToken')).toBeNull();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login']);
    });
  });
});
