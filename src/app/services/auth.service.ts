import { computed, inject, Injectable, signal } from "@angular/core";
import { catchError, map, Observable, of, tap } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { environment } from "../../environments/environment";
import { AuthResponse, User } from "../interfaces";
import { AuthStatus } from "../enums/auth-status.enum";
import { RegisterData } from "../interfaces/register-data.interace";
import { handleApiError } from "./utils/api-error-handler";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private _currentUser = signal<User | null>(null);
  private _authStatus = signal<AuthStatus>(AuthStatus.checking);
  private readonly FLOW_STATE_KEY = "auth_flow_email";

  public currentUser = computed(() => this._currentUser());
  public authStatus = computed(() => this._authStatus());

  private readonly apiUrl: string = environment.API_URL;

  private router = inject(Router);
  private http = inject(HttpClient);

  constructor() {
    this.checkAuthStatus().subscribe();
  }

  public setTempEmailForFlow(email: string): void {
    sessionStorage.setItem(this.FLOW_STATE_KEY, email);
  }

  public getTempEmailForFlow(): string | null {
    return sessionStorage.getItem(this.FLOW_STATE_KEY);
  }

  public clearTempEmailForFlow(): void {
    sessionStorage.removeItem(this.FLOW_STATE_KEY);
  }

  public updateCurrentUserState(updatedUser: User): void {
    this._currentUser.set(updatedUser);
  }

  setCurrentUser = ({ user, token }: AuthResponse) => {
    this._currentUser.set(user);
    this._authStatus.set(AuthStatus.authenticated);
    localStorage.setItem("accessToken", token.accessToken);
    if (token.refreshToken) {
      localStorage.setItem("refreshToken", token.refreshToken);
    }
    this.clearTempEmailForFlow();
  };

  login(email: string, password: string): Observable<boolean> {
    const url = `${this.apiUrl}/auth/login`;
    const body = { email, password };
    return this.http.post<AuthResponse>(url, body).pipe(
      tap(({ user, token }) => {
        this.setCurrentUser({ user, token });
      }),
      map(() => true),
      catchError((error) => {
        return handleApiError(error);
      })
    );
  }

  register(data: RegisterData): Observable<boolean> {
    const url = `${this.apiUrl}/auth/register`;
    const body = { ...data };
    return this.http.post<{ message: string }>(url, body).pipe(
      tap((message) => {
        console.log(message);
      }),
      map(() => true),
      catchError((error) => {
        return handleApiError(error);
      })
    );
  }

  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http
      .post<{ message: string }>(`${this.apiUrl}/auth/forgot-password`, {
        email,
      })
      .pipe(catchError(handleApiError));
  }

  verifyResetCode(email: string, code: string): Observable<boolean> {
    const url = `${this.apiUrl}/auth/verify-reset-code`;
    const body = { email, code };
    return this.http.post<{ valid: boolean }>(url, body).pipe(
      map((response) => response.valid),
      catchError((error) => {
        return handleApiError(error);
      })
    );
  }

  resetPassword(
    email: string,
    newPassword: string,
    code: string
  ): Observable<{ message: string }> {
    const url = `${this.apiUrl}/auth/reset-password`;
    const body = { email, newPassword, code };
    return this.http.post<{ message: string }>(url, body).pipe(
      catchError((error) => {
        return handleApiError(error);
      })
    );
  }

  checkAuthStatus(): Observable<boolean> {
    const url = `${this.apiUrl}/auth/checkToken`;
    const token = localStorage.getItem("accessToken");

    if (!token) {
      this.clearAuthData();
      return of(false);
    }

    return this.http.get<AuthResponse>(url).pipe(
      map(({ user, token }) => {
        this.setCurrentUser({ user, token });
        return true;
      }),
      catchError(() => {
        this._authStatus.set(AuthStatus.unauthenticated);
        this._currentUser.set(null);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        return of(false);
      })
    );
  }

  confirmEmail(token: string): Observable<boolean> {
    const url = `${this.apiUrl}/auth/confirm-email?token=${token}`;

    return this.http.get<AuthResponse>(url).pipe(
      tap(({ user, token }) => {
        this.setCurrentUser({ user, token });
      }),
      map(() => true),
      catchError((error) => handleApiError(error))
    );
  }

  isAuthenticated(): boolean {
    return this.authStatus() === AuthStatus.authenticated;
  }

  isAdmin(): boolean {
    const user = this.currentUser();
    return user ? user.roles.includes("ADMIN") : false;
  }

  isSuperAdmin(): boolean {
    const user = this.currentUser();
    return user ? user.roles.includes("SUPERADMIN") : false;
  }

  private clearAuthData() {
    this._currentUser.set(null);
    this._authStatus.set(AuthStatus.unauthenticated);
    this.clearTempEmailForFlow();
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }

  logout() {
    this.clearAuthData();
    this.router.navigate(["/auth/login"]);
  }
}
