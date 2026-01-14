import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Provider, ProviderCreate, ProviderUpdate, ProviderListResponse, ProviderResponse } from '../models/provider.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProviderService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/providers`;

  getAll(): Observable<ProviderListResponse> {
    return this.http.get<ProviderListResponse>(`${this.apiUrl}/`);
  }

  getById(id: string): Observable<ProviderResponse> {
    return this.http.get<ProviderResponse>(`${this.apiUrl}/${id}/`);
  }

  create(provider: ProviderCreate): Observable<ProviderResponse> {
    return this.http.post<ProviderResponse>(`${this.apiUrl}/`, provider);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/`);
  }
}
