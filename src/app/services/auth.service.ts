import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { AuthResponse, User } from '../interfaces'
import { AuthStatus } from '../enums/auth-status.enum';
import { RegisterData } from '../interfaces/register-data.interace';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private _currentUser = signal<User | null>(null);
  private _authStatus = signal<AuthStatus>(AuthStatus.checking);

  public currentUser = computed(() => this._currentUser());
  public authStatus = computed(() => this._authStatus());

  private readonly apiUrl: string = environment.API_URL
  
  private router = inject(Router)
  private http = inject(HttpClient)

  setCurrentUser = ({user, token}: AuthResponse) => {
    this._currentUser.set(user)
    this._authStatus.set(AuthStatus.authenticated)
    localStorage.setItem('accessToken', token.accessToken)
    if (token.refreshToken) {
      localStorage.setItem('refreshToken', token.refreshToken)
    }
    console.log({user, accessToken: token.accessToken, refreshToken: token.refreshToken});
    
  }

  login(email: string, password: string): Observable<boolean> {
    const url = `${this.apiUrl}/auth/login`
    const body = { email, password }
    return this.http.post<AuthResponse>(url, body).pipe(
      tap(({user, token})=> {
        this.setCurrentUser({user, token})
      }),
      map(() => true),
      catchError((error) => {
        console.log(error);
        return throwError(() => error.error.message)
      })
    )
  }

  register(data: RegisterData): Observable<boolean> {
    const url = `${this.apiUrl}/auth/register`
    const body = { ...data }
    return this.http.post<{message: string}>(url, body).pipe(
      tap((message)=> {
        console.log(message);
      }),
      map(() => true),
      catchError((error) => {
        console.log(error);
        return throwError(() => error.error.message)
      })
    )
  }
  
  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/auth/forgot-password`, { email });
  }

  verifyResetCode(email: string, code: string): Observable<boolean> {
    const url = `${this.apiUrl}/auth/verify-reset-code`;
    const body = { email, code };
    return this.http.post<{ valid: boolean }>(url, body).pipe(
      map(response => response.valid), // Extrae el 'valid: true'
      catchError((error) => {
        // Lanza el mensaje de error del backend (ej: "Invalid code")
        return throwError(() => error.error?.message || 'Código inválido o expirado');
      })
    );
  }

  resetPassword(email: string, newPassword: string, code: string): Observable<{ message: string }> {
    const url = `${this.apiUrl}/auth/reset-password`;
    const body = { email, newPassword, code };
    return this.http.post<{ message: string }>(url, body).pipe(
      catchError((error) => {
        return throwError(() => error.error?.message || 'Error al resetear contraseña');
      })
    );
  }

  checkAuthStatus(): Observable<boolean> {
    const url = `${this.apiUrl}/auth/check-status`
    const token = localStorage.getItem('accessToken')

    if (!token) {
      this._authStatus.set(AuthStatus.unauthenticated)
      return of(false)
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`)
    
    return this.http.get<AuthResponse>(url, { headers }).pipe(
      map(({user, token}) => {
        this.setCurrentUser({user, token})
        return true
      }),
      catchError(() => of(false))
    )
  }

  confirmEmail(token: string): Observable<boolean> {
    const url = `${this.apiUrl}/auth/confirm-email?token=${token}`;
    
    // Tu backend devuelve un AuthResponse (user + token)
    return this.http.get<AuthResponse>(url).pipe(
      tap(({user, token}) => {
        // Logueamos al usuario directamente usando tu helper
        this.setCurrentUser({user, token});
      }),
      map(() => true),
      catchError((error) => {
        return throwError(() => error.error?.message || 'Error al confirmar el email')
      })
    );
  }

  isAuthenticated(): boolean {
    return this.authStatus() === AuthStatus.authenticated;
  }

  isAdmin(): boolean {
    const user = this.currentUser();
    return user ? user.roles.includes('ADMIN') : false;
  }

  isSuperAdmin(): boolean {
    const user = this.currentUser();
    return user ? user.roles.includes('SUPERADMIN') : false;
  }

  logout() {
    this._currentUser.set(null)
    this._authStatus.set(AuthStatus.unauthenticated)
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    this.router.navigate(['/auth/login'])
  }
}
