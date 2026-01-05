import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TokenRequest, TokenResponse, RefreshTokenRequest } from '../models/auth.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/token`;

  login(credentials: TokenRequest): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.apiUrl}/`, credentials);
  }

  refreshToken(refreshToken: RefreshTokenRequest): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.apiUrl}/refresh/`, refreshToken);
  }
}

