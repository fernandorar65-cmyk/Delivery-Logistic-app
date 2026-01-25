import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import {
  InternalUserCreate,
  InternalUserListResponse,
  InternalUserOwnerType,
  InternalUserResponse
} from '@app/features/internal-users/models/internal-user.model';

@Injectable({
  providedIn: 'root'
})
export class InternalUsersService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  list(ownerType: InternalUserOwnerType, ownerId: string): Observable<InternalUserListResponse> {
    return this.http.get<InternalUserListResponse>(`${this.getBasePath(ownerType, ownerId)}/`);
  }

  create(ownerType: InternalUserOwnerType, ownerId: string, payload: InternalUserCreate): Observable<InternalUserResponse> {
    return this.http.post<InternalUserResponse>(`${this.getBasePath(ownerType, ownerId)}/`, payload);
  }

  remove(ownerType: InternalUserOwnerType, ownerId: string, userId: string): Observable<void> {
    return this.http.delete<void>(`${this.getBasePath(ownerType, ownerId)}/${userId}/`);
  }

  getMe(ownerType: InternalUserOwnerType): Observable<InternalUserResponse> {
    return this.http.get<InternalUserResponse>(`${this.getOwnerBasePath(ownerType)}/internal-users/me/`);
  }

  private getBasePath(ownerType: InternalUserOwnerType, ownerId: string): string {
    return `${this.getOwnerBasePath(ownerType)}/${ownerId}/internal-users`;
  }

  private getOwnerBasePath(ownerType: InternalUserOwnerType): string {
    switch (ownerType) {
      case 'provider':
        return `${this.apiUrl}/providers`;
      case 'company':
        return `${this.apiUrl}/companies`;
      case 'client':
        return `${this.apiUrl}/clients`;
      default:
        return `${this.apiUrl}/providers`;
    }
  }
}
