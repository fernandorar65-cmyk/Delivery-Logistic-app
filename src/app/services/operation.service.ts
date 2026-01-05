import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Operation, OperationCreate, OperationUpdate } from '../models/operation.model';

@Injectable({
  providedIn: 'root'
})
export class OperationService {
  private http = inject(HttpClient);
  private apiUrl = '/api/v1/operations';

  getAll(): Observable<Operation[]> {
    return this.http.get<Operation[]>(`${this.apiUrl}/`);
  }

  getById(id: number): Observable<Operation> {
    return this.http.get<Operation>(`${this.apiUrl}/${id}/`);
  }

  create(operation: OperationCreate): Observable<Operation> {
    return this.http.post<Operation>(`${this.apiUrl}/`, operation);
  }

  update(id: number, operation: OperationUpdate): Observable<Operation> {
    return this.http.put<Operation>(`${this.apiUrl}/${id}/`, operation);
  }

  partialUpdate(id: number, operation: OperationUpdate): Observable<Operation> {
    return this.http.patch<Operation>(`${this.apiUrl}/${id}/`, operation);
  }
}

