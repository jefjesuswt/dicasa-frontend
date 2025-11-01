import { User } from "../users/user.interface";
import { Property } from "../properties/property.interface";
import { AppointmentStatus } from "./appointmnet-status.enum";

type PopulatedAgent = Pick<
  User,
  "_id" | "email" | "name" | "phoneNumber" | "profileImageUrl"
>;
type PopulatedProperty = Pick<
  Property,
  "_id" | "title" | "price" | "images" | "status"
>;

export interface Appointment {
  _id: string;
  property: PopulatedProperty;
  agent: PopulatedAgent;
  name: string;
  email: string;
  phoneNumber: string;
  message: string;
  status: AppointmentStatus;
  appointmentDate: string;
  createdAt: string;
  updatedAt: string;
}
