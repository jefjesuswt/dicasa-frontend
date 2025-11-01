import { Property } from "./property.interface";

export interface PaginatedProperties {
  data: Property[];
  total: number;
  page: number;
  limit: number;
}
