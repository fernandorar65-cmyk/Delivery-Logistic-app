import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Operation, OperationCreate, OperationUpdate } from '../models/operation.model';
import { PaginatedResponse } from '../models/paginated-response.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OperationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/operations`;

  getAll(page: number = 1): Observable<PaginatedResponse<Operation>> {
    const params = new HttpParams().set('page', page.toString());
    return this.http.get<PaginatedResponse<Operation>>(`${this.apiUrl}/`, { params });
  }

  getById(id: string): Observable<Operation> {
    return this.http.get<Operation>(`${this.apiUrl}/${id}/`);
  }

  create(operation: OperationCreate): Observable<Operation> {
    return this.http.post<Operation>(`${this.apiUrl}/`, operation);
  }

  update(id: string, operation: OperationUpdate): Observable<Operation> {
    return this.http.put<Operation>(`${this.apiUrl}/${id}/`, operation);
  }

  partialUpdate(id: string, operation: OperationUpdate): Observable<Operation> {
    return this.http.patch<Operation>(`${this.apiUrl}/${id}/`, operation);
  }
}

