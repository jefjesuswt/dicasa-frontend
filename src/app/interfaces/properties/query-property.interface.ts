export interface QueryPropertiesParams {
  page?: number;
  limit?: number;
  search?: string;
  state?: string;
  city?: string;
  type?: string;
  status?: string | string[];
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  featured?: boolean;
  includeDeleted?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
