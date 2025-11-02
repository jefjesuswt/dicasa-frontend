import { inject, Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { handleApiError } from "./utils/api-error-handler";
import { User } from "../interfaces/users";
import { UserRole } from "../interfaces/users/roles.enum";
import { QueryUserParams } from "../interfaces/users/query-user.interface";
import { PaginatedUserResponse } from "../interfaces/users/paginated-user.response.interface";

export type CreateUserPayload = Pick<
  User,
  "name" | "email" | "phoneNumber" | "roles"
> & {
  password?: string;
};
export type UpdateUserPayload = Partial<
  Pick<User, "name" | "email" | "phoneNumber" | "roles" | "isActive">
>;

@Injectable({
  providedIn: "root",
})
export class UsersService {
  private readonly apiUrl: string = `${environment.API_URL}/users`;
  private http = inject(HttpClient);

  getUsers(query: QueryUserParams = {}): Observable<PaginatedUserResponse> {
    let params = new HttpParams();

    if (query.page) params = params.set("page", query.page.toString());
    if (query.limit) params = params.set("limit", query.limit.toString());
    if (query.search) params = params.set("search", query.search);
    if (query.role) params = params.set("role", query.role);

    return this.http
      .get<PaginatedUserResponse>(this.apiUrl, { params })
      .pipe(catchError(handleApiError));
  }

  getAgents(): Observable<User[]> {
    const params = new HttpParams().set("page", "1").set("limit", "500");

    return this.http.get<PaginatedUserResponse>(this.apiUrl, { params }).pipe(
      map((response) =>
        response.data.filter(
          (user) =>
            user.roles.includes(UserRole.ADMIN) ||
            user.roles.includes(UserRole.SUPERADMIN)
        )
      ),
      catchError(handleApiError)
    );
  }

  getUserById(id: string): Observable<User> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<User>(url).pipe(catchError(handleApiError));
  }

  createUser(payload: CreateUserPayload): Observable<User> {
    const url = `${this.apiUrl}/create`;
    return this.http.post<User>(url, payload).pipe(catchError(handleApiError));
  }

  updateUser(id: string, payload: UpdateUserPayload): Observable<User> {
    const url = `${this.apiUrl}/superadmin/${id}`;
    return this.http.patch<User>(url, payload).pipe(catchError(handleApiError));
  }

  deleteUser(id: string): Observable<void> {
    const url = `${this.apiUrl}/superadmin/${id}`;
    return this.http.delete<void>(url).pipe(catchError(handleApiError));
  }

  updateProfilePicture(file: File): Observable<User> {
    const formData = new FormData();
    formData.append("profileImage", file);

    const url = `${this.apiUrl}/me/picture`;

    return this.http.put<User>(url, formData).pipe(
      catchError((error) => {
        return handleApiError(error);
      })
    );
  }

  updateMyInfo(data: { name: string; phoneNumber: string }): Observable<User> {
    const url = `${this.apiUrl}/me`;
    return this.http.patch<User>(url, data).pipe(
      catchError((error) => {
        return handleApiError(error);
      })
    );
  }

  changePassword(
    oldPassword: string,
    newPassword: string
  ): Observable<{ message: string }> {
    const url = `${this.apiUrl}/change-password`;
    const body = { password: oldPassword, newPassword };
    return this.http.post<{ message: string }>(url, body).pipe(
      catchError((error) => {
        return handleApiError(error);
      })
    );
  }
}
