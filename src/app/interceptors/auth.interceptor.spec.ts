import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './auth.interceptor';
import { environment } from '../../environments/environment';

describe('AuthInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting()
      ]
    });

    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('should add Authorization header when token exists and request is to API', () => {
    const token = 'test-token';
    localStorage.setItem('accessToken', token);

    httpClient.get(`${environment.API_URL}/test`).subscribe();

    const req = httpMock.expectOne(`${environment.API_URL}/test`);
    expect(req.request.headers.has('Authorization')).toBeTrue();
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
  });

  it('should NOT add Authorization header when token does not exist', () => {
    httpClient.get(`${environment.API_URL}/test`).subscribe();

    const req = httpMock.expectOne(`${environment.API_URL}/test`);
    expect(req.request.headers.has('Authorization')).toBeFalse();
  });

  it('should NOT add Authorization header when request is NOT to API', () => {
    const token = 'test-token';
    localStorage.setItem('accessToken', token);
    const externalUrl = 'https://external-api.com/data';

    httpClient.get(externalUrl).subscribe();

    const req = httpMock.expectOne(externalUrl);
    expect(req.request.headers.has('Authorization')).toBeFalse();
  });
});
