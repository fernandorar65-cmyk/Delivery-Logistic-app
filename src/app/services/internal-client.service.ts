import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InternalClient, InternalClientCreate, InternalClientUpdate } from '../models/internal-client.model';

@Injectable({
  providedIn: 'root'
})
export class InternalClientService {
  private http = inject(HttpClient);
  private apiUrl = '/api/v1/internal-clients';

  getAll(): Observable<InternalClient[]> {
    return this.http.get<InternalClient[]>(`${this.apiUrl}/`);
  }

  getById(id: number): Observable<InternalClient> {
    return this.http.get<InternalClient>(`${this.apiUrl}/${id}/`);
  }

  create(internalClient: InternalClientCreate): Observable<InternalClient> {
    return this.http.post<InternalClient>(`${this.apiUrl}/`, internalClient);
  }

  update(id: number, internalClient: InternalClientUpdate): Observable<InternalClient> {
    return this.http.put<InternalClient>(`${this.apiUrl}/${id}/`, internalClient);
  }

  partialUpdate(id: number, internalClient: InternalClientUpdate): Observable<InternalClient> {
    return this.http.patch<InternalClient>(`${this.apiUrl}/${id}/`, internalClient);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/`);
  }
}

