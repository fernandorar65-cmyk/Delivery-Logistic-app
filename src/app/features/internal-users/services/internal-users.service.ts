import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import {
  InternalUserCreate,
  InternalUserListResponse,
  InternalUserResponse
} from '@app/features/internal-users/models/internal-user.model';

@Injectable({
  providedIn: 'root'
})
export class InternalUsersService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  list(providerId: string): Observable<InternalUserListResponse> {
    return this.http.get<InternalUserListResponse>(`${this.getBasePath(providerId)}/`);
  }

  create(providerId: string, payload: InternalUserCreate): Observable<InternalUserResponse> {
    return this.http.post<InternalUserResponse>(`${this.getBasePath(providerId)}/`, payload);
  }

  remove(providerId: string, userId: string): Observable<void> {
    return this.http.delete<void>(`${this.getBasePath(providerId)}/${userId}/`);
  }

  private getBasePath(providerId: string): string {
    return `${this.apiUrl}/providers/${providerId}/internal-users`;
  }
}
