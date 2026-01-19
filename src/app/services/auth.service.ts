import {
  computed,
  inject,
  Injectable,
  signal,
  PLATFORM_ID,
} from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { catchError, finalize, map, Observable, of, tap } from "rxjs";
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
      // 2. Verificación REAL con el backend (en segundo plano)
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

  /**
   * Establece el usuario actual y guarda el token según la preferencia "Recordarme".
   * @param authResponse Respuesta del login con usuario y token
   * @param rememberMe Si es true, usa localStorage. Si es false, usa sessionStorage.
   */
  setCurrentUser = (
    { user, token }: AuthResponse,
    rememberMe: boolean = true
  ) => {
    this._currentUser.set(user);
    this._authStatus.set(AuthStatus.authenticated);

    if (isPlatformBrowser(this.platformId)) {
      const storage = rememberMe ? localStorage : sessionStorage;

      // Limpiamos el otro storage para evitar duplicados/conflictos
      const otherStorage = rememberMe ? sessionStorage : localStorage;
      otherStorage.removeItem("accessToken");
      otherStorage.removeItem("refreshToken");

      storage.setItem("accessToken", token.accessToken);
      if (token.refreshToken) {
        storage.setItem("refreshToken", token.refreshToken);
      }
    }

    this.clearTempEmailForFlow();
  };

  login(
    email: string,
    password: string,
    rememberMe: boolean = false
  ): Observable<boolean> {
    const url = `${this.apiUrl}/login`;
    const body = { email, password };
    return this.http.post<AuthResponse>(url, body).pipe(
      tap(({ user, token }) => {
        this.setCurrentUser({ user, token }, rememberMe);
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
    if (!isPlatformBrowser(this.platformId)) {
      return of(false);
    }

    const url = `${this.apiUrl}/checkToken`;
    // Buscar primero en localStorage, luego en sessionStorage
    let token = localStorage.getItem("accessToken");
    let usedStorage: Storage = localStorage;

    if (!token) {
      token = sessionStorage.getItem("accessToken");
      usedStorage = sessionStorage;
    }

    if (!token) {
      this.clearAuthData();
      return of(false);
    }

    return this.http.get<AuthResponse>(url).pipe(
      map(({ user, token }) => {
        // Mantenemos la sesión donde se encontró (localStorage o sessionStorage)
        // Checkeamos si venía de localStorage para mantener "rememberMe = true"
        const cameFromLocal = usedStorage === localStorage;
        this.setCurrentUser({ user, token }, cameFromLocal);
        return true;
      }),
      catchError(() => {
        this.clearAuthData();
        return of(false);
      })
    );
  }

  confirmEmail(token: string): Observable<boolean> {
    const url = `${this.apiUrl}/confirm-email?token=${token}`;

    return this.http.get<AuthResponse>(url).pipe(
      tap(({ user, token }) => {
        // Por defecto en confirmación, asumimos persistencia (true) o lo que prefieras.
        // Usualmente tras confirmar email se loguea persistente.
        this.setCurrentUser({ user, token }, true);
      }),
      map(() => true),
      catchError((error) => handleApiError(error))
    );
  }

  isAuthenticated(): boolean {
    return this.authStatus() === AuthStatus.authenticated;
  }

  /**
   * Verifica si el usuario tiene el rol ADMIN (IT/Sistema).
   * Este es el rol con más privilegios.
   */
  isAdmin(): boolean {
    const user = this.currentUser();
    return user ? user.roles.includes(UserRole.ADMIN) : false;
  }

  /**
   * Verifica si el usuario tiene el rol MANAGER (Gerente).
   * Puede gestionar propiedades, citas, agentes.
   */
  isManager(): boolean {
    const user = this.currentUser();
    return user ? user.roles.includes(UserRole.MANAGER) : false;
  }

  /**
   * Verifica si el usuario tiene el rol AGENT (Vendedor).
   * Puede gestionar sus propiedades y citas asignadas.
   */
  isAgent(): boolean {
    const user = this.currentUser();
    return user ? user.roles.includes(UserRole.AGENT) : false;
  }

  /**
   * Verifica si el usuario puede acceder al dashboard administrativo.
   * Solo MANAGER y ADMIN tienen acceso.
   */
  canAccessDashboard(): boolean {
    return this.isManager() || this.isAdmin();
  }

  /**
   * Verifica si el usuario es parte del staff (empleado).
   * AGENT, MANAGER o ADMIN.
   */
  isStaff(): boolean {
    return this.isAgent() || this.isManager() || this.isAdmin();
  }

  private clearAuthData() {
    this._currentUser.set(null);
    this._authStatus.set(AuthStatus.unauthenticated);
    this.clearTempEmailForFlow();

    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("refreshToken");
    }
  }

  logout() {
    this.http.post(`${this.apiUrl}/logout`, {})
      .pipe(finalize(() => {
        this.clearAuthData();
        this.router.navigate(["/auth/login"]);
      }))
      .subscribe();
  }
}
