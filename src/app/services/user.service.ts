import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}`;

  CheckUserEmail(email: string): Observable<unknown> {
    const params = new HttpParams().set('email', email);
    return this.http.get<unknown>(`${this.apiUrl}/users/check-provider/`, { params });
  }
}
