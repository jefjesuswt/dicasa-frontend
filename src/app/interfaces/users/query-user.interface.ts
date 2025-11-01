import { UserRole } from "./roles.enum";

export interface QueryUserParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
}
