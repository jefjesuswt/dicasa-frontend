import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, Subject, tap } from "rxjs";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Router } from "@angular/router";
import { environment } from "../../environments/environment";
import { Property } from "../interfaces/properties/property.interface";
import { handleApiError } from "./utils/api-error-handler";
import { QueryPropertiesParams } from "../interfaces/properties/query-property.interface";
import { PaginatedProperties } from "../interfaces/properties/paginated-properties.interface";

export type CreatePropertyPayload = Omit<
  Property,
  "_id" | "agent" | "createdAt" | "updatedAt"
>;
export type UpdatePropertyPayload = Partial<CreatePropertyPayload>;

@Injectable({
  providedIn: "root",
})
export class PropertyService {
  private http = inject(HttpClient);

  private readonly apiUrl: string = `${environment.API_URL}/properties`;

  private statsChanged$ = new Subject<void>();

  constructor() {}

  get statsUpdates$(): Observable<void> {
    return this.statsChanged$.asObservable();
  }

  getProperties(
    queryParams: QueryPropertiesParams = {}
  ): Observable<PaginatedProperties> {
    let params = new HttpParams();

    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params = params.set(key, value.toString());
      }
    });

    return this.http
      .get<PaginatedProperties>(this.apiUrl, { params })
      .pipe(catchError(handleApiError));
  }

  getProperty(id: string): Observable<Property> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<Property>(url).pipe(catchError(handleApiError));
  }

  uploadPropertyImages(files: File[]): Observable<string[]> {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append("images", file, file.name);
    });

    const url = `${this.apiUrl}/upload`;

    return this.http
      .post<string[]>(url, formData)
      .pipe(catchError(handleApiError));
  }

  createProperty(payload: CreatePropertyPayload): Observable<Property> {
    return this.http.post<Property>(this.apiUrl, payload).pipe(
      tap(() => this.statsChanged$.next()),
      catchError(handleApiError)
    );
  }

  updateProperty(
    id: string,
    payload: UpdatePropertyPayload
  ): Observable<Property> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.patch<Property>(url, payload).pipe(
      tap(() => this.statsChanged$.next()),
      catchError(handleApiError)
    );
  }

  deleteProperty(id: string): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url).pipe(
      tap(() => this.statsChanged$.next()),
      catchError(handleApiError)
    );
  }

  getFeaturedProperties(): Observable<Property[]> {
    return this.getProperties({ featured: true, page: 1, limit: 6 }).pipe(
      map((response) => response.data)
    );
  }

  getPropertiesByStatus(
    status: "sale" | "rent" | "sold" | "rented"
  ): Observable<Property[]> {
    return this.getProperties({ status: status }).pipe(
      map((response) => response.data)
    );
  }

  getPropertiesByType(
    type: "apartment" | "house" | "villa" | "land" | "commercial"
  ): Observable<Property[]> {
    return this.getProperties({ type: type }).pipe(
      map((response) => response.data)
    );
  }
}
