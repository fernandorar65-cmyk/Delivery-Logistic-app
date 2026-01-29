import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Company, CompanyCreate, CompanyUpdate, CompanyListResponse, CompanyResponse } from '@app/features/companies/models/company.model';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/companies`;

  getAll(): Observable<CompanyListResponse> {
    return this.http.get<CompanyListResponse>(`${this.apiUrl}/`).pipe(
      map((response) => this.normalizeListResponse(response))
    );
  }

  getById(id: string): Observable<CompanyResponse> {
    return this.http.get<CompanyResponse>(`${this.apiUrl}/${id}/`).pipe(
      map((response) => this.normalizeResponse(response))
    );
  }

  create(company: CompanyCreate): Observable<CompanyResponse> {
    return this.http.post<CompanyResponse>(`${this.apiUrl}/`, company).pipe(
      map((response) => this.normalizeResponse(response))
    );
  }

  getMe(): Observable<CompanyResponse> {
    return this.http.get<CompanyResponse>(`${this.apiUrl}/me/`).pipe(
      map((response) => this.normalizeResponse(response))
    );
  }

  update(id: string, company: CompanyUpdate): Observable<CompanyResponse> {
    return this.http.put<CompanyResponse>(`${this.apiUrl}/${id}/`, company).pipe(
      map((response) => this.normalizeResponse(response))
    );
  }

  partialUpdate(id: string, company: CompanyUpdate): Observable<CompanyResponse> {
    return this.http.patch<CompanyResponse>(`${this.apiUrl}/${id}/`, company).pipe(
      map((response) => this.normalizeResponse(response))
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/`);
  }

  private normalizeListResponse(response: CompanyListResponse): CompanyListResponse {
    const items = Array.isArray(response?.result) ? response.result.map((company) => this.normalizeCompany(company)) : [];
    return {
      ...response,
      result: items
    };
  }

  private normalizeResponse(response: CompanyResponse): CompanyResponse {
    if (!response?.result) {
      return response;
    }
    return {
      ...response,
      result: this.normalizeCompany(response.result)
    };
  }

  private normalizeCompany(company: Company): Company {
    const email = company.email ?? company.user_email ?? '';
    const name = company.name ?? company.company_name ?? '';
    return {
      ...company,
      email,
      name
    };
  }
}






