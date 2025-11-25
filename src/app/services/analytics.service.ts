import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable, Subscription, interval, tap } from "rxjs";
import {
  CreateVisitDto,
  HeartbeatDto,
  HeartbeatResponse,
  SessionResponse,
  StartSessionDto,
  VisitResponse,
} from "../interfaces/analytics/analytics.interface";
import { environment } from "../../environments/environment";

// Interfaz para la respuesta del Dashboard
export interface DashboardStats {
  kpis: {
    activeUsers: number;
    totalVisitsMonth: number;
    avgPermanence: number;
    schedulingRate: string;
    cipherCompliance: string;
    totalProperties: number;
  };
  charts: {
    inventory: { _id: string; count: number }[];
    schedulingFunnel: { total: number; completed: number };
  };
  security: {
    recentLogs: {
      _id: string;
      userId: string;
      action: string;
      createdAt: string;
    }[];
    alertsCount: number;
  };
}
@Injectable({
  providedIn: "root",
})
export class AnalyticsService {
  // Inyección de HttpClient (estilo moderno o constructor, ambos funcionan)
  private http = inject(HttpClient);

  // URL del Microservicio (Dicasa Analytics)
  // Se usa para logs masivos (visitas, sesiones) para no saturar el backend principal
  private analyticsUrl = environment.ANALYTICS_API_URL;

  // URL del Backend Principal (Dicasa Backend / Gateway)
  // Se usa para datos sensibles o administrativos (Dashboard) protegidos por ADMIN
  private mainApiUrl = environment.API_URL;

  // Lógica del Heartbeat
  private heartbeatSubscription?: Subscription;
  private isHeartbeatActive = false;
  private readonly heartbeatInterval = 30000;

  constructor() {}

  /**
   * Obtiene las estadísticas completas para el Dashboard Administrativo.
   * Esta petición viaja al Backend Principal (Gateway), el cual valida
   * que seas ADMIN y luego consulta internamente al microservicio.
   */
  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(
      `${this.mainApiUrl}/analytics/dashboard`
    );
  }

  /**
   * Registra una nueva visita.
   * Va directo al microservicio de analíticas.
   */
  logVisit(dto: CreateVisitDto): Observable<VisitResponse> {
    return this.http
      .post<VisitResponse>(`${this.analyticsUrl}/analytics/visit`, dto)
      .pipe(tap(() => console.log("Visit logged")));
  }

  /**
   * Inicia una sesión de usuario para seguimiento de tiempo.
   */
  startSession(dto: StartSessionDto): Observable<SessionResponse> {
    return this.http.post<SessionResponse>(
      `${this.analyticsUrl}/analytics/session/start`,
      dto
    );
  }

  /**
   * Inicia el bucle de "latidos" para mantener la sesión viva
   * y calcular el tiempo de permanencia con precisión.
   */
  startHeartbeatLoop(sessionId: string): void {
    if (this.isHeartbeatActive) {
      return;
    }

    this.isHeartbeatActive = true;
    console.log("Heartbeat loop started.");

    this.heartbeatSubscription = interval(this.heartbeatInterval).subscribe(
      () => {
        const dto: HeartbeatDto = { sessionId };

        this.http
          .post<HeartbeatResponse>(
            `${this.analyticsUrl}/analytics/session/heartbeat`,
            dto
          )
          .subscribe({
            next: () => console.log("Heartbeat sent"),
            error: (err) => {
              console.error("Heartbeat failed", err);
              this.stopHeartbeatLoop();
            },
          });
      }
    );
  }

  /**
   * Detiene el envío de latidos (al salir de la app o cerrar sesión).
   */
  stopHeartbeatLoop(): void {
    if (this.heartbeatSubscription) {
      this.heartbeatSubscription.unsubscribe();
    }
    this.isHeartbeatActive = false;
    console.log("Heartbeat loop stopped.");
  }
}
