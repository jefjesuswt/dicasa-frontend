import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { catchError, map, Observable, of } from "rxjs";

import {
  CreateAppointmentDto,
  ReassignAgentDto,
  UpdateAppointmentDto,
} from "../interfaces/appointments";
import { Appointment } from "../interfaces/appointments/appointment.interface";
import { environment } from "../../environments/environment";
import { handleApiError } from "./utils/api-error-handler";
import { QueryAppointmentParams } from "../interfaces/appointments/query-appointment.interface";
import { PaginatedAppointmentResponse } from "../interfaces/appointments/paginated-appointment-response.interface";

@Injectable({
  providedIn: "root",
})
export class AppointmentsService {
  private readonly apiUrl = `${environment.API_URL}/appointments`;

  constructor(private http: HttpClient) { }

  create(dto: CreateAppointmentDto): Observable<Appointment> {
    return this.http
      .post<Appointment>(this.apiUrl, dto)
      .pipe(catchError(handleApiError));
  }

  getAppointments(
    query: QueryAppointmentParams = {}
  ): Observable<PaginatedAppointmentResponse> {
    let params = new HttpParams();

    if (query.page) params = params.set("page", query.page.toString());
    if (query.limit) params = params.set("limit", query.limit.toString());
    if (query.search) params = params.set("search", query.search);
    if (query.status) params = params.set("status", query.status);
    if (query.includeDeleted) params = params.set("includeDeleted", "true");
    if (query.sortBy) params = params.set("sortBy", query.sortBy);
    if (query.sortOrder) params = params.set("sortOrder", query.sortOrder);

    return this.http
      .get<PaginatedAppointmentResponse>(this.apiUrl, { params })
      .pipe(catchError(handleApiError));
  }

  findAll(): Observable<Appointment[]> {
    return this.http
      .get<Appointment[]>(this.apiUrl)
      .pipe(catchError(handleApiError));
  }

  findMyAppointments(): Observable<Appointment[]> {
    return this.http
      .get<Appointment[]>(`${this.apiUrl}/me`)
      .pipe(catchError(handleApiError));
  }

  findOne(id: string): Observable<Appointment> {
    return this.http
      .get<Appointment>(`${this.apiUrl}/${id}`)
      .pipe(catchError(handleApiError));
  }

  update(id: string, dto: UpdateAppointmentDto): Observable<Appointment> {
    return this.http
      .patch<Appointment>(`${this.apiUrl}/${id}`, dto)
      .pipe(catchError(handleApiError));
  }

  reassignAgent(id: string, dto: ReassignAgentDto): Observable<Appointment> {
    return this.http
      .patch<Appointment>(`${this.apiUrl}/${id}/reassign-agent`, dto)
      .pipe(catchError(handleApiError));
  }

  getAgentAvailability(agentId: string): Observable<Date[]> {
    return this.http
      .get<string[]>(`${this.apiUrl}/agent/${agentId}/availability`)
      .pipe(
        map((dates) => dates.map((d) => new Date(d))),
        catchError(() => of([]))
      );
  }

  remove(id: string): Observable<{ message: string }> {
    return this.http
      .delete<{ message: string }>(`${this.apiUrl}/${id}`)
      .pipe(catchError(handleApiError));
  }
}
