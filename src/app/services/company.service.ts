import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Company, CompanyCreate, CompanyUpdate, CompanyListResponse } from '../models/company.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/companies`;

  getAll(): Observable<CompanyListResponse> {
    return this.http.get<CompanyListResponse>(`${this.apiUrl}/`);
  }

  getById(id: string): Observable<Company> {
    return this.http.get<Company>(`${this.apiUrl}/${id}/`);
  }

  create(company: CompanyCreate): Observable<Company> {
    return this.http.post<Company>(`${this.apiUrl}/`, company);
  }

  update(id: string, company: CompanyUpdate): Observable<Company> {
    return this.http.put<Company>(`${this.apiUrl}/${id}/`, company);
  }

  partialUpdate(id: string, company: CompanyUpdate): Observable<Company> {
    return this.http.patch<Company>(`${this.apiUrl}/${id}/`, company);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/`);
  }
}
