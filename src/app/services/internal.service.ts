import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Internal, InternalCreate, InternalUpdate } from '../models/internal.model';
import { PaginatedResponse } from '../models/paginated-response.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InternalService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/internals`;

  getAll(page: number = 1): Observable<PaginatedResponse<Internal>> {
    const params = new HttpParams().set('page', page.toString());
    return this.http.get<PaginatedResponse<Internal>>(`${this.apiUrl}/`, { params });
  }

  getById(id: number): Observable<Internal> {
    return this.http.get<Internal>(`${this.apiUrl}/${id}/`);
  }

  create(internal: InternalCreate): Observable<Internal> {
    console.log("aca", internal);
    return this.http.post<Internal>(`${this.apiUrl}/`, internal);
  }

  update(id: number, internal: InternalUpdate): Observable<Internal> {
    return this.http.put<Internal>(`${this.apiUrl}/${id}/`, internal);
  }

  partialUpdate(id: number, internal: InternalUpdate): Observable<Internal> {
    return this.http.patch<Internal>(`${this.apiUrl}/${id}/`, internal);
  }
}

