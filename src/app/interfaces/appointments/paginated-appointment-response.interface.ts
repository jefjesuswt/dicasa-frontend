import { Appointment } from "./appointment.interface";

export interface PaginatedAppointmentResponse {
  data: Appointment[];
  total: number;
  page: number;
  limit: number;
}
