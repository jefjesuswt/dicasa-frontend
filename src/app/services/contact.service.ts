import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, catchError } from "rxjs";
import { environment } from "../../environments/environment";
import { handleApiError } from "./utils/api-error-handler";
import { CreateContactDto } from "../interfaces/contact/create-contact.dto";

@Injectable({
  providedIn: "root",
})
export class ContactService {
  private http = inject(HttpClient);
  private readonly apiUrl: string = `${environment.API_URL}/contact`;

  sendMessage(payload: CreateContactDto): Observable<{ message: string }> {
    const url = `${this.apiUrl}/send`;
    return this.http
      .post<{ message: string }>(url, payload)
      .pipe(catchError(handleApiError));
  }
}
