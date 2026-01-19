import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import {
  TokenRequest,
  TokenResponse,
  TokenResponseWrapper,
  RefreshTokenRequest,
  RefreshTokenResponse,
  RefreshTokenResponseWrapper
} from '@app/core/auth/models/auth.model';
import { StorageService } from '@app/core/storage/storage.service';
import { environment } from 'environments/environment';

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
    return this.http
      .post<TokenResponse | TokenResponseWrapper>(`${this.apiUrl}/obtain/`, credentials)
      .pipe(map((response) => this.normalizeTokenResponse(response)));
  }

  refreshToken(refreshToken: RefreshTokenRequest): Observable<RefreshTokenResponse> {
    return this.http
      .post<RefreshTokenResponse | RefreshTokenResponseWrapper>(`${this.apiUrl}/refresh/`, refreshToken)
      .pipe(map((response) => this.normalizeRefreshTokenResponse(response)));
  }

  logout(): void {
    // Limpiar todos los datos del localStorage
    if (isPlatformBrowser(this.platformId)) {
      this.storageService.clear();
    }
    // Redirigir al login
    this.router.navigate(['/login']);
  }

  private normalizeTokenResponse(response: TokenResponse | TokenResponseWrapper): TokenResponse {
    if ('result' in response) {
      if (response.errors && response.errors.length > 0) {
        throw new Error('Auth error');
      }
      if (!response.result) {
        throw new Error('Auth response missing result');
      }
      return response.result;
    }
    return response;
  }

  private normalizeRefreshTokenResponse(
    response: RefreshTokenResponse | RefreshTokenResponseWrapper
  ): RefreshTokenResponse {
    if ('result' in response) {
      if (response.errors && response.errors.length > 0) {
        throw new Error('Refresh token error');
      }
      if (!response.result) {
        throw new Error('Refresh token response missing result');
      }
      return response.result;
    }
    return response;
  }
}







