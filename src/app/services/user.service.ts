import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, UserCreate, UserUpdate } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = '/api/v1/users';

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/`);
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

