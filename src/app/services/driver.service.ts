import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Driver, DriverCreate, DriverUpdate } from '../models/driver.model';
import { PaginatedResponse } from '../models/paginated-response.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DriverService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/drivers`;

  getAll(page: number = 1): Observable<PaginatedResponse<Driver>> {
    const params = new HttpParams().set('page', page.toString());
    return this.http.get<PaginatedResponse<Driver>>(`${this.apiUrl}/`, { params });
  }

  getById(id: number): Observable<Driver> {
    return this.http.get<Driver>(`${this.apiUrl}/${id}/`);
  }

  create(driver: DriverCreate): Observable<Driver> {
    return this.http.post<Driver>(`${this.apiUrl}/`, driver);
  }

  update(id: number, driver: DriverUpdate): Observable<Driver> {
    return this.http.put<Driver>(`${this.apiUrl}/${id}/`, driver);
  }

  partialUpdate(id: number, driver: DriverUpdate): Observable<Driver> {
    return this.http.patch<Driver>(`${this.apiUrl}/${id}/`, driver);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/`);
  }
}

