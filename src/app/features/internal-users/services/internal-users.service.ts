import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import {
  InternalUserCreate,
  InternalUserListResponse,
  InternalUserOwnerType,
  InternalUserResponse,
  InternalUserUpdate
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

  create(
    ownerType: InternalUserOwnerType,
    ownerId: string,
    payload: InternalUserCreate
  ): Observable<InternalUserResponse> {
    return this.http.post<InternalUserResponse>(`${this.getBasePath(ownerType, ownerId)}/`, payload);
  }

  update(
    ownerType: InternalUserOwnerType,
    ownerId: string,
    userId: string,
    payload: InternalUserUpdate
  ): Observable<InternalUserResponse> {
    return this.http.put<InternalUserResponse>(`${this.getBasePath(ownerType, ownerId)}/${userId}/`, payload);
  }

  remove(ownerType: InternalUserOwnerType, ownerId: string, userId: string): Observable<void> {
    return this.http.delete<void>(`${this.getBasePath(ownerType, ownerId)}/${userId}/`);
  }

  setActive(
    ownerType: InternalUserOwnerType,
    ownerId: string,
    userId: string,
    isActive: boolean
  ): Observable<InternalUserResponse> {
    return this.http.patch<InternalUserResponse>(`${this.getBasePath(ownerType, ownerId)}/${userId}/`, {
      is_active: isActive
    });
  }

  private getBasePath(ownerType: InternalUserOwnerType, ownerId: string): string {
    const ownerSegment = this.getOwnerSegment(ownerType);
    return `${this.apiUrl}/${ownerSegment}/${ownerId}/internal-users`;
  }

  private getOwnerSegment(ownerType: InternalUserOwnerType): string {
    switch (ownerType) {
      case 'company':
        return 'companies';
      case 'provider':
        return 'providers';
      case 'client':
        return 'clients';
      default:
        return 'companies';
    }
  }
}
