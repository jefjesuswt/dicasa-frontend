import { User } from "./user.interface";

export interface PaginatedUserResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
}
