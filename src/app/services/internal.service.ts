import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Internal, InternalCreate, InternalUpdate } from '../models/internal.model';

@Injectable({
  providedIn: 'root'
})
export class InternalService {
  private http = inject(HttpClient);
  private apiUrl = '/api/v1/internals';

  getAll(): Observable<Internal[]> {
    return this.http.get<Internal[]>(`${this.apiUrl}/`);
  }

  getById(id: number): Observable<Internal> {
    return this.http.get<Internal>(`${this.apiUrl}/${id}/`);
  }

  create(internal: InternalCreate): Observable<Internal> {
    return this.http.post<Internal>(`${this.apiUrl}/`, internal);
  }
}

