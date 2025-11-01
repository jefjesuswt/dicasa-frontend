import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { catchError, Observable } from "rxjs";

// Importa las interfaces desde tu estructura de archivos
import {
  CreateAppointmentDto,
  ReassignAgentDto,
  UpdateAppointmentDto,
} from "../interfaces/appointments";
import { Appointment } from "../interfaces/appointments/appointment.interface";
import { environment } from "../../environments/environment";
import { handleApiError } from "./utils/api-error-handler";

@Injectable({
  providedIn: "root",
})
export class AppointmentsService {
  private readonly apiUrl = `${environment.API_URL}/appointments`;

  constructor(private http: HttpClient) {}

  create(dto: CreateAppointmentDto): Observable<Appointment> {
    return this.http
      .post<Appointment>(this.apiUrl, dto)
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

  remove(id: string): Observable<{ message: string }> {
    return this.http
      .delete<{ message: string }>(`${this.apiUrl}/${id}`)
      .pipe(catchError(handleApiError));
  }
}
