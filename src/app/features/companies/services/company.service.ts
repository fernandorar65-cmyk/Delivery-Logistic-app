import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Company, CompanyCreate, CompanyUpdate, CompanyListResponse, CompanyResponse } from '@app/features/companies/models/company.model';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/companies`;

  getAll(): Observable<CompanyListResponse> {
    return this.http.get<CompanyListResponse>(`${this.apiUrl}/`);
  }

  getById(id: string): Observable<CompanyResponse> {
    return this.http.get<CompanyResponse>(`${this.apiUrl}/${id}/`);
  }

  create(company: CompanyCreate): Observable<CompanyResponse> {
    return this.http.post<CompanyResponse>(`${this.apiUrl}/`, company);
  }

  update(id: string, company: CompanyUpdate): Observable<CompanyResponse> {
    return this.http.put<CompanyResponse>(`${this.apiUrl}/${id}/`, company);
  }

  partialUpdate(id: string, company: CompanyUpdate): Observable<CompanyResponse> {
    return this.http.patch<CompanyResponse>(`${this.apiUrl}/${id}/`, company);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/`);
  }
}






