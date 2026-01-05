import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Driver, DriverCreate, DriverUpdate } from '../models/driver.model';

@Injectable({
  providedIn: 'root'
})
export class DriverService {
  private http = inject(HttpClient);
  private apiUrl = '/api/v1/drivers';

  getAll(): Observable<Driver[]> {
    return this.http.get<Driver[]>(this.apiUrl);
  }

  getById(id: number): Observable<Driver> {
    return this.http.get<Driver>(`${this.apiUrl}/${id}/`);
  }

  create(driver: DriverCreate): Observable<Driver> {
    return this.http.post<Driver>(this.apiUrl, driver);
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

