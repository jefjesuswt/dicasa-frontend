import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { handleApiError } from './utils/api-error-handler';
import { User } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class UsersService {


  private readonly apiUrl: string = environment.API_URL;
  private http = inject(HttpClient);

  updateProfilePicture(file: File): Observable<User> {
    const formData = new FormData();
    formData.append('profileImage', file);

    const url = `${this.apiUrl}/users/me/picture`;

    // Solo hace la petición y devuelve el Observable<User>
    // No usa 'tap' ni actualiza ningún 'signal'
    return this.http.put<User>(url, formData).pipe(
      catchError((error) => {
        return handleApiError(error);
      })
    );
  }

  updateMyInfo(data: { name: string, phoneNumber: string }): Observable<User> {
    // ❗ crear este endpoint en NestJS (ej. PATCH /users/me)
    const url = `${this.apiUrl}/users/me`; 
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
    const url = `${this.apiUrl}/auth/change-password`;
    const body = { password: oldPassword, newPassword };
    return this.http.post<{ message: string }>(url, body).pipe(
      catchError((error) => {
        return handleApiError(error);
      })
    );
  }
}
