import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Client, ClientCreate, ClientUpdate } from '../models/client.model';
import { PaginatedResponse } from '../models/paginated-response.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/clients`;

  getAll(page: number = 1): Observable<PaginatedResponse<Client>> {
    const params = new HttpParams().set('page', page.toString());
    return this.http.get<PaginatedResponse<Client>>(`${this.apiUrl}/`, { params });
  }

  getById(id: string): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/${id}/`);
  }

  create(client: ClientCreate): Observable<Client> {
    return this.http.post<Client>(`${this.apiUrl}/`, client);
  }

  update(id: string, client: ClientUpdate): Observable<Client> {
    return this.http.put<Client>(`${this.apiUrl}/${id}/`, client);
  }

  partialUpdate(id: string, client: ClientUpdate): Observable<Client> {
    return this.http.patch<Client>(`${this.apiUrl}/${id}/`, client);
  }
}

