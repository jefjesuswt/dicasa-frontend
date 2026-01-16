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

// Interfaz para Action Log
export interface ActionLog {
  _id: string;
  userId: string;
  userName?: string; // Deprecated - usar user.name
  action: string;
  resourceId?: string;
  createdAt: string;
  metadata?: any;
  // Nuevos campos enriquecidos
  user?: {
    _id: string;
    name: string;
    email: string;
  };
  resource?: {
    _id: string;
    title: string;
    type: 'property' | 'appointment' | 'user' | 'unknown';
  } | null; // null si el recurso fue eliminado
}

// Interfaz para respuesta paginada de Action Logs
export interface PaginatedActionLogs {
  data: ActionLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

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
    visitsTrend: { date: string; count: number }[];
    topProperties: {
      _id: any;
      appointmentsCount: number;
      title: string;
      price: number;
    }[];
    topAgents: {
      _id: any;
      totalAppointments: number;
      completedAppointments: number;
      name: string;
      email: string;
      conversionRate: number;
    }[];
  };
  security: {
    recentLogs: {
      _id: string;
      userId: string;
      action: string;
      createdAt: string;
      resourceId?: string;
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

  // URL del Backend Principal (Dicasa Backend)
  // Se usa para todas las operaciones de analítica (monolito)
  private mainApiUrl = environment.API_URL;

  // Lógica del Heartbeat
  private heartbeatSubscription?: Subscription;
  private isHeartbeatActive = false;
  private readonly heartbeatInterval = 30000;

  constructor() { }

  /**
   * Obtiene las estadísticas completas para el Dashboard Administrativo.
   */
  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(
      `${this.mainApiUrl}/analytics/dashboard`
    );
  }

  /**
   * Obtiene los action logs con paginación y filtros opcionales.
   */
  getActionLogs(
    page: number = 1,
    limit: number = 10,
    action?: string,
    userId?: string
  ): Observable<PaginatedActionLogs> {
    let params = `page=${page}&limit=${limit}`;

    if (action) {
      params += `&action=${action}`;
    }

    if (userId) {
      params += `&userId=${userId}`;
    }

    return this.http.get<PaginatedActionLogs>(
      `${this.mainApiUrl}/analytics/action-logs?${params}`
    );
  }

  /**
   * Registra una nueva visita.
   */
  logVisit(dto: CreateVisitDto): Observable<VisitResponse> {
    return this.http
      .post<VisitResponse>(`${this.mainApiUrl}/analytics/visit`, dto)
      .pipe(tap(() => console.log("Visit logged")));
  }

  /**
   * Inicia una sesión de usuario para seguimiento de tiempo.
   */
  startSession(dto: StartSessionDto): Observable<SessionResponse> {
    return this.http.post<SessionResponse>(
      `${this.mainApiUrl}/analytics/session/start`,
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
            `${this.mainApiUrl}/analytics/session/heartbeat`,
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
