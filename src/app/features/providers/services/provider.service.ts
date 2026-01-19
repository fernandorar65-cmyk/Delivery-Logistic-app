import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProviderCheckResponse, ProviderCreate, ProviderListResponse, ProviderResponse } from '@app/features/providers/models/provider.model';
import { CompanyProviderMatchRequest, CompanyProviderMatchResponse } from '@app/features/providers/models/company-provider-match.model';
import { environment } from 'environments/environment';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ProviderService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}`;

  getAll(user_type: string): Observable<ProviderListResponse> {
    if(user_type === 'company') {
      return this.http.get<ProviderListResponse>(`${this.apiUrl}/company-providers/my-providers/`);
    }
    return this.http.get<ProviderListResponse>(`${this.apiUrl}/providers/`);
  }

  getById(id: string): Observable<ProviderResponse> {
    return this.http.get<ProviderResponse>(`${this.apiUrl}/providers/${id}/`);
  }

  create(provider: ProviderCreate): Observable<ProviderResponse> {
    return this.http.post<ProviderResponse>(`${this.apiUrl}/providers/`, provider);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/providers/${id}/`);
  }

  checkProviderEmail(email: string): Observable<ProviderCheckResponse> {
    const params = new HttpParams().set('email', email);
    return this.http.get<ProviderCheckResponse>(`${this.apiUrl}/users/check-provider/`, { params });
  }
  
  sendCompanyProviderRequest(payload: CompanyProviderMatchRequest): Observable<CompanyProviderMatchResponse> {
    return this.http.post<CompanyProviderMatchResponse>(`${this.apiUrl}/company-providers/send-request/`, payload);
  }
}






