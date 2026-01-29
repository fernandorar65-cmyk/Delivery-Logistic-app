import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ClientCreate, ClientListResponse, ClientResponse, ClientUpdate } from '@app/features/clients/models/client.model';
import { CompanyRequestPendingListResponse } from '@app/features/clients/models/company-request-pending.model';
import { ClientCompanyListResponse } from '@app/features/clients/models/client-company.model';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/clients`;

  getAll(page: number = 1): Observable<ClientListResponse> {
    const params = new HttpParams().set('page', page.toString());
    return this.http.get<ClientListResponse>(`${this.apiUrl}/`, { params }).pipe(
      map((response) => this.normalizeListResponse(response))
    );
  }

  getPendingCompanyClients(): Observable<CompanyRequestPendingListResponse> {
    return this.http.get<CompanyRequestPendingListResponse>(`${environment.apiUrl}/company-clients/pending/`);
  }

  getMyCompanies(): Observable<ClientCompanyListResponse> {
    return this.http.get<ClientCompanyListResponse>(`${environment.apiUrl}/company-clients/my-companies/`);
  }

  acceptCompanyClientRequest(requestId: string): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/company-clients/${requestId}/accept/`, {});
  }

  rejectCompanyClientRequest(requestId: string): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/company-clients/${requestId}/reject/`, {});
  }

  getById(id: string): Observable<ClientResponse> {
    return this.http.get<ClientResponse>(`${this.apiUrl}/${id}/`).pipe(
      map((response) => this.normalizeResponse(response))
    );
  }

  create(client: ClientCreate): Observable<ClientResponse> {
    return this.http.post<ClientResponse>(`${this.apiUrl}/`, client).pipe(
      map((response) => this.normalizeResponse(response))
    );
  }

  getMe(): Observable<ClientResponse> {
    return this.http.get<ClientResponse>(`${this.apiUrl}/me/`).pipe(
      map((response) => this.normalizeResponse(response))
    );
  }

  update(id: string, client: ClientUpdate): Observable<ClientResponse> {
    return this.http.put<ClientResponse>(`${this.apiUrl}/${id}/`, client).pipe(
      map((response) => this.normalizeResponse(response))
    );
  }

  partialUpdate(id: string, client: ClientUpdate): Observable<ClientResponse> {
    return this.http.patch<ClientResponse>(`${this.apiUrl}/${id}/`, client).pipe(
      map((response) => this.normalizeResponse(response))
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/`);
  }

  private normalizeListResponse(response: ClientListResponse): ClientListResponse {
    const items = Array.isArray(response?.result) ? response.result.map((client) => this.normalizeClient(client)) : [];
    return {
      ...response,
      result: items
    };
  }

  private normalizeResponse(response: ClientResponse): ClientResponse {
    if (!response?.result) {
      return response;
    }
    return {
      ...response,
      result: this.normalizeClient(response.result)
    };
  }

  private normalizeClient(client: ClientResponse['result']) {
    const email = client.email ?? client.user_email ?? '';
    const name = client.name ?? client.client_name ?? '';
    return {
      ...client,
      email,
      name
    };
  }
}







