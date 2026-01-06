import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, UserCreate, UserUpdate } from '../models/user.model';
import { PaginatedResponse } from '../models/paginated-response.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/users`;

  getAll(page: number = 1): Observable<PaginatedResponse<User>> {
    const params = new HttpParams().set('page', page.toString());
    return this.http.get<PaginatedResponse<User>>(`${this.apiUrl}/`, { params });
  }

  getById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}/`);
  }

  create(user: UserCreate): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/`, user);
  }

  update(id: number, user: UserUpdate): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}/`, user);
  }

  partialUpdate(id: number, user: UserUpdate): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}/`, user);
  }
}

