import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Client, ClientCreate, ClientUpdate } from '../models/client.model';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private http = inject(HttpClient);
  private apiUrl = '/api/v1/clients';

  getAll(): Observable<Client[]> {
    return this.http.get<Client[]>(this.apiUrl);
  }

  getById(id: number): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/${id}/`);
  }

  create(client: ClientCreate): Observable<Client> {
    return this.http.post<Client>(this.apiUrl, client);
  }

  update(id: number, client: ClientUpdate): Observable<Client> {
    return this.http.put<Client>(`${this.apiUrl}/${id}/`, client);
  }

  partialUpdate(id: number, client: ClientUpdate): Observable<Client> {
    return this.http.patch<Client>(`${this.apiUrl}/${id}/`, client);
  }
}

