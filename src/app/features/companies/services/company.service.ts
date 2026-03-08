import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Company, CompanyCreate, CompanyUpdate, CompanyListResponse, CompanyResponse } from '@app/features/companies/models/company.model';
import {
  OrderAssignmentRequest,
  OrderAssignmentRequestsResponse
} from '@app/features/companies/models/order-assignment-request.model';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/companies`;

  getAll(): Observable<CompanyListResponse> {
    return this.http.get<CompanyListResponse>(`${this.apiUrl}/`).pipe(
      map((response) => this.normalizeListResponse(response))
    );
  }

  getById(id: string): Observable<CompanyResponse> {
    return this.http.get<CompanyResponse>(`${this.apiUrl}/${id}/`).pipe(
      map((response) => this.normalizeResponse(response))
    );
  }

  create(company: CompanyCreate): Observable<CompanyResponse> {
    return this.http.post<CompanyResponse>(`${this.apiUrl}/`, company).pipe(
      map((response) => this.normalizeResponse(response))
    );
  }

  getMe(): Observable<CompanyResponse> {
    return this.http.get<CompanyResponse>(`${this.apiUrl}/me/`).pipe(
      map((response) => this.normalizeResponse(response))
    );
  }

  update(id: string, company: CompanyUpdate): Observable<CompanyResponse> {
    return this.http.put<CompanyResponse>(`${this.apiUrl}/${id}/`, company).pipe(
      map((response) => this.normalizeResponse(response))
    );
  }

  partialUpdate(id: string, company: CompanyUpdate): Observable<CompanyResponse> {
    return this.http.patch<CompanyResponse>(`${this.apiUrl}/${id}/`, company).pipe(
      map((response) => this.normalizeResponse(response))
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/`);
  }

  /** Parámetros para listar solicitudes de asignación: page (1, 2, 3...) y status (accepted | rejected | pending). */
  getOrderAssignmentRequests(
    companyId: string,
    params?: { page?: number; status?: 'accepted' | 'rejected' | 'pending' }
  ): Observable<OrderAssignmentRequestsResponse> {
    let httpParams = new HttpParams();
    if (params?.page != null && params.page >= 1) {
      httpParams = httpParams.set('page', String(params.page));
    }
    if (params?.status != null) {
      httpParams = httpParams.set('status', params.status);
    }
    return this.http
      .get<OrderAssignmentRequestsResponse>(
        `${this.apiUrl}/${companyId}/order-assignment-requests/`,
        { params: httpParams }
      )
      .pipe(
        map((response) => {
          const result = response?.result;
          return {
            ...response,
            result: Array.isArray(result) ? result : [],
            pagination: response?.pagination ?? { total: 0 }
          };
        })
      );
  }

  /** Aceptar una solicitud de asignación de orden. */
  acceptOrderAssignmentRequest(companyId: string, requestId: string): Observable<OrderAssignmentRequest | unknown> {
    return this.http.post<OrderAssignmentRequest | unknown>(
      `${this.apiUrl}/${companyId}/order-assignment-requests/${requestId}/accept/`,
      {}
    );
  }

  /** Rechazar una solicitud de asignación de orden. */
  rejectOrderAssignmentRequest(companyId: string, requestId: string): Observable<OrderAssignmentRequest | unknown> {
    return this.http.post<OrderAssignmentRequest | unknown>(
      `${this.apiUrl}/${companyId}/order-assignment-requests/${requestId}/reject/`,
      {}
    );
  }

  private normalizeListResponse(response: CompanyListResponse): CompanyListResponse {
    const items = Array.isArray(response?.result) ? response.result.map((company) => this.normalizeCompany(company)) : [];
    return {
      ...response,
      result: items
    };
  }

  private normalizeResponse(response: CompanyResponse): CompanyResponse {
    if (!response?.result) {
      return response;
    }
    return {
      ...response,
      result: this.normalizeCompany(response.result)
    };
  }

  private normalizeCompany(company: Company): Company {
    const email = company.email ?? company.user_email ?? '';
    const name = company.name ?? company.company_name ?? '';
    return {
      ...company,
      email,
      name
    };
  }
}






