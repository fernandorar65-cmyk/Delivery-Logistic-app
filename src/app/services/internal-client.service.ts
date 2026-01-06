import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InternalClient, InternalClientCreate, InternalClientUpdate } from '../models/internal-client.model';
import { PaginatedResponse } from '../models/paginated-response.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InternalClientService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/internals`;

  getAll(page: number = 1): Observable<PaginatedResponse<InternalClient>> {
    const params = new HttpParams().set('page', page.toString());
    return this.http.get<PaginatedResponse<InternalClient>>(`${this.apiUrl}/`, { params });
  }

  getById(id: string): Observable<InternalClient> {
    return this.http.get<InternalClient>(`${this.apiUrl}/${id}/`);
  }

  create(internalClient: InternalClientCreate): Observable<InternalClient> {
    return this.http.post<InternalClient>(`${this.apiUrl}/`, internalClient);
  }

  update(id: string, internalClient: InternalClientUpdate): Observable<InternalClient> {
    return this.http.put<InternalClient>(`${this.apiUrl}/${id}/`, internalClient);
  }

  partialUpdate(id: string, internalClient: InternalClientUpdate): Observable<InternalClient> {
    return this.http.patch<InternalClient>(`${this.apiUrl}/${id}/`, internalClient);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/`);
  }
}

