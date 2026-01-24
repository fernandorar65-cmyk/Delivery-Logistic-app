import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ClientCreate, ClientListResponse, ClientResponse, ClientUpdate } from '@app/features/clients/models/client.model';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/clients`;

  getAll(page: number = 1): Observable<ClientListResponse> {
    const params = new HttpParams().set('page', page.toString());
    return this.http.get<ClientListResponse>(`${this.apiUrl}/`, { params });
  }

  getById(id: string): Observable<ClientResponse> {
    return this.http.get<ClientResponse>(`${this.apiUrl}/${id}/`);
  }

  create(client: ClientCreate): Observable<ClientResponse> {
    return this.http.post<ClientResponse>(`${this.apiUrl}/`, client);
  }

  update(id: string, client: ClientUpdate): Observable<ClientResponse> {
    return this.http.put<ClientResponse>(`${this.apiUrl}/${id}/`, client);
  }

  partialUpdate(id: string, client: ClientUpdate): Observable<ClientResponse> {
    return this.http.patch<ClientResponse>(`${this.apiUrl}/${id}/`, client);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/`);
  }
}







