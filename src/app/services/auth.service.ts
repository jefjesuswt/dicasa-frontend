import {
  computed,
  inject,
  Injectable,
  signal,
  PLATFORM_ID,
} from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { catchError, map, Observable, of, tap } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { environment } from "../../environments/environment";
import { AuthStatus } from "../enums/auth-status.enum";
import { handleApiError } from "./utils/api-error-handler";
import { AuthResponse, RegisterData, User } from "../interfaces/users";
import { UserRole } from "../interfaces/users/roles.enum";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private _currentUser = signal<User | null>(null);
  private _authStatus = signal<AuthStatus>(AuthStatus.checking);
  private readonly FLOW_STATE_KEY = "auth_flow_email";

  // Inyectamos el ID de la plataforma para saber si es Server o Browser
  private platformId = inject(PLATFORM_ID);

  public currentUser = computed(() => this._currentUser());
  public authStatus = computed(() => this._authStatus());

  private readonly apiUrl: string = `${environment.API_URL}/auth`;

  private router = inject(Router);
  private http = inject(HttpClient);

  constructor() {
    // CORRECCIÓN CRÍTICA: Solo intentamos chequear auth si estamos en el navegador.
    // El servidor (Node.js) no tiene token ni localStorage.
    if (isPlatformBrowser(this.platformId)) {
      this.checkAuthStatus().subscribe();
    } else {
      // En el servidor, asumimos directamente que no está autenticado
      this._authStatus.set(AuthStatus.unauthenticated);
    }
  }

  // --- MÉTODOS DE SESSION STORAGE (Protegidos) ---

  public setTempEmailForFlow(email: string): void {
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.setItem(this.FLOW_STATE_KEY, email);
    }
  }

  public getTempEmailForFlow(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return sessionStorage.getItem(this.FLOW_STATE_KEY);
    }
    return null;
  }

  public clearTempEmailForFlow(): void {
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.removeItem(this.FLOW_STATE_KEY);
    }
  }

  // --- MÉTODOS PRINCIPALES ---

  public updateCurrentUserState(updatedUser: User): void {
    this._currentUser.set(updatedUser);
  }

  setCurrentUser = ({ user, token }: AuthResponse) => {
    this._currentUser.set(user);
    this._authStatus.set(AuthStatus.authenticated);

    // Protección de LocalStorage
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem("accessToken", token.accessToken);
      if (token.refreshToken) {
        localStorage.setItem("refreshToken", token.refreshToken);
      }
    }

    this.clearTempEmailForFlow();
  };

  login(email: string, password: string): Observable<boolean> {
    const url = `${this.apiUrl}/login`;
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
    const url = `${this.apiUrl}/register`;
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
      .post<{ message: string }>(`${this.apiUrl}/forgot-password`, {
        email,
      })
      .pipe(catchError(handleApiError));
  }

  verifyResetCode(email: string, code: string): Observable<boolean> {
    const url = `${this.apiUrl}/verify-reset-code`;
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
    const url = `${this.apiUrl}/reset-password`;
    const body = { email, newPassword, code };
    return this.http.post<{ message: string }>(url, body).pipe(
      catchError((error) => {
        return handleApiError(error);
      })
    );
  }

  checkAuthStatus(): Observable<boolean> {
    // 1. Si estamos en el SERVIDOR, retornamos false inmediatamente.
    // Esto evita el error "localStorage is not defined".
    if (!isPlatformBrowser(this.platformId)) {
      return of(false);
    }

    // 2. Lógica normal del NAVEGADOR
    const url = `${this.apiUrl}/checkToken`;
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
        // Seguro borrar porque ya validamos isPlatformBrowser arriba
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        return of(false);
      })
    );
  }

  confirmEmail(token: string): Observable<boolean> {
    const url = `${this.apiUrl}/confirm-email?token=${token}`;

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
    return user ? user.roles.includes(UserRole.ADMIN) : false;
  }

  isSuperAdmin(): boolean {
    const user = this.currentUser();
    return user ? user.roles.includes(UserRole.SUPERADMIN) : false;
  }

  private clearAuthData() {
    this._currentUser.set(null);
    this._authStatus.set(AuthStatus.unauthenticated);
    this.clearTempEmailForFlow();

    // Protección de LocalStorage
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  }

  logout() {
    this.clearAuthData();
    this.router.navigate(["/auth/login"]);
  }
}
