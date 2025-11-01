import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { State } from "../interfaces/location/states.interface";
import { City } from "../interfaces/location/cities.interface";

@Injectable({
  providedIn: "root",
})
export class LocationService {
  private http = inject(HttpClient);

  private apiUrl = `${environment.API_URL}/location`;

  getStates(): Observable<State[]> {
    return this.http.get<State[]>(`${this.apiUrl}/states`);
  }

  getCities(stateName: string): Observable<string[]> {
    const encodedState = encodeURIComponent(stateName);
    return this.http.get<string[]>(`${this.apiUrl}/cities/${encodedState}`);
  }
}
