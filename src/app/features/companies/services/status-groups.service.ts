import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { StatusGroupCreate, StatusGroupListResponse, StatusGroupResponse } from '@app/features/companies/models/status-group.model';

@Injectable({
  providedIn: 'root'
})
export class StatusGroupsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/companies`;

  create(companyId: string, payload: StatusGroupCreate): Observable<StatusGroupResponse> {
    return this.http.post<StatusGroupResponse>(`${this.apiUrl}/${companyId}/status-groups/`, payload);
  }

  list(companyId: string): Observable<StatusGroupListResponse> {
    return this.http.get<StatusGroupListResponse>(`${this.apiUrl}/${companyId}/status-groups/`);
  }

  update(companyId: string, groupId: string, payload: StatusGroupCreate): Observable<StatusGroupResponse> {
    return this.http.put<StatusGroupResponse>(`${this.apiUrl}/${companyId}/status-groups/${groupId}/`, payload);
  }

  delete(companyId: string, groupId: string): Observable<StatusGroupResponse> {
    return this.http.delete<StatusGroupResponse>(`${this.apiUrl}/${companyId}/status-groups/${groupId}/`);
  }
}
