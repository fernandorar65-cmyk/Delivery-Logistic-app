import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Vehicle, VehicleCreate, VehicleUpdate, VehicleListResponse, VehicleResponse } from '../models/vehicle.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/vehicles`;

  getAll(): Observable<VehicleListResponse> {
    return this.http.get<VehicleListResponse>(`${this.apiUrl}/`);
  }

  getById(id: string): Observable<VehicleResponse> {
    return this.http.get<VehicleResponse>(`${this.apiUrl}/${id}/`);
  }

  create(vehicle: VehicleCreate): Observable<VehicleResponse> {
    return this.http.post<VehicleResponse>(`${this.apiUrl}/`, vehicle);
  }

  update(id: string, vehicle: VehicleUpdate): Observable<VehicleResponse> {
    return this.http.patch<VehicleResponse>(`${this.apiUrl}/${id}/`, vehicle);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/`);
  }
}
