import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
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

@Injectable({
  providedIn: "root",
})
export class AnalyticsService {
  private apiUrl = environment.ANALYTICS_API_URL;

  // Lógica del Heartbeat
  private heartbeatSubscription?: Subscription;
  private isHeartbeatActive = false;
  private readonly heartbeatInterval = 30000;

  constructor(private http: HttpClient) {}

  logVisit(dto: CreateVisitDto): Observable<VisitResponse> {
    return this.http
      .post<VisitResponse>(`${this.apiUrl}/analytics/visit`, dto)
      .pipe(tap(() => console.log("Visit logged")));
  }

  startSession(dto: StartSessionDto): Observable<SessionResponse> {
    return this.http.post<SessionResponse>(
      `${this.apiUrl}/analytics/session/start`,
      dto
    );
  }

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
            `${this.apiUrl}/analytics/session/heartbeat`,
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

  stopHeartbeatLoop(): void {
    if (this.heartbeatSubscription) {
      this.heartbeatSubscription.unsubscribe();
    }
    this.isHeartbeatActive = false;
    console.log("Heartbeat loop stopped.");
  }
}
