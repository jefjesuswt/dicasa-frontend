import { AppointmentStatus } from "./appointmnet-status.enum";

export interface CreateAppointmentDto {
  name: string;
  email: string;
  phoneNumber: string;
  message: string;
  propertyId: string;
  appointmentDate: string;
}

export interface UpdateAppointmentDto {
  appointmentDate?: string;
  status?: AppointmentStatus;
}

export interface ReassignAgentDto {
  newAgentId: string;
}
