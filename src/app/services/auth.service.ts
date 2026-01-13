import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { TokenRequest, TokenResponse, RefreshTokenRequest, RefreshTokenResponse } from '../models/auth.model';
import { StorageService } from './storage.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private storageService = inject(StorageService);
  private platformId = inject(PLATFORM_ID);
  private apiUrl = `${environment.apiUrl}/token`;

  login(credentials: TokenRequest): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.apiUrl}/obtain/`, credentials);
  }

  refreshToken(refreshToken: RefreshTokenRequest): Observable<RefreshTokenResponse> {
    return this.http.post<RefreshTokenResponse>(`${this.apiUrl}/refresh/`, refreshToken);
  }

  logout(): void {
    // Limpiar todos los datos del localStorage
    if (isPlatformBrowser(this.platformId)) {
      this.storageService.clear();
    }
    // Redirigir al login
    this.router.navigate(['/login']);
  }
}

