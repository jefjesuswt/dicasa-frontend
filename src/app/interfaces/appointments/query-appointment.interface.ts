import { AppointmentStatus } from "./appointmnet-status.enum";

export interface QueryAppointmentParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: AppointmentStatus;
  includeDeleted?: boolean;
}
