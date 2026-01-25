import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { StatusGroupCreate, StatusGroupResponse } from '@app/features/companies/models/status-group.model';

@Injectable({
  providedIn: 'root'
})
export class StatusGroupsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/companies`;

  create(companyId: string, payload: StatusGroupCreate): Observable<StatusGroupResponse> {
    return this.http.post<StatusGroupResponse>(`${this.apiUrl}/${companyId}/status-groups/`, payload);
  }
}
