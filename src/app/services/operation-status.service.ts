import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OperationStatus, OperationStatusCreate, OperationStatusUpdate } from '../models/operation-status.model';

@Injectable({
  providedIn: 'root'
})
export class OperationStatusService {
  private http = inject(HttpClient);
  private apiUrl = '/api/v1/operation-statuses';
  private operationsApiUrl = '/api/v1/operations';

  getById(id: number): Observable<OperationStatus> {
    return this.http.get<OperationStatus>(`${this.apiUrl}/${id}/`);
  }

  update(id: number, status: OperationStatusUpdate): Observable<OperationStatus> {
    return this.http.put<OperationStatus>(`${this.apiUrl}/${id}/`, status);
  }

  partialUpdate(id: number, status: OperationStatusUpdate): Observable<OperationStatus> {
    return this.http.patch<OperationStatus>(`${this.apiUrl}/${id}/`, status);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/`);
  }

  // Endpoints relacionados con operations/{id}/statuses/
  getByOperationId(operationId: number): Observable<OperationStatus[]> {
    return this.http.get<OperationStatus[]>(`${this.operationsApiUrl}/${operationId}/statuses/`);
  }

  createForOperation(operationId: number, status: OperationStatusCreate): Observable<OperationStatus> {
    return this.http.post<OperationStatus>(`${this.operationsApiUrl}/${operationId}/statuses/`, status);
  }

  updateForOperation(operationId: number, statusId: number, status: OperationStatusUpdate): Observable<OperationStatus> {
    return this.http.put<OperationStatus>(`${this.operationsApiUrl}/${operationId}/statuses/${statusId}/`, status);
  }

  deleteForOperation(operationId: number, statusId: number): Observable<void> {
    return this.http.delete<void>(`${this.operationsApiUrl}/${operationId}/statuses/${statusId}/`);
  }
}

