import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { StorageService } from '../services/storage.service';

// Función para decodificar JWT sin verificar la firma (solo para obtener el payload)
function decodeJWT(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

// Función para verificar si el token está expirado
function isTokenExpired(token: string | null): boolean {
  if (!token) return true;

  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return true;

  // Obtener el tiempo actual en segundos
  const currentTime = Math.floor(Date.now() / 1000);
  // Tiempo de expiración del token
  const expirationTime = decoded.exp;

  // El token está expirado si el tiempo actual es mayor o igual al tiempo de expiración
  return currentTime >= expirationTime;
}

// Función para verificar si el token está por expirar (en los próximos 5 minutos)
function isTokenExpiringSoon(token: string | null): boolean {
  if (!token) return true;

  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return true;

  // Obtener el tiempo actual en segundos
  const currentTime = Math.floor(Date.now() / 1000);
  // Tiempo de expiración del token
  const expirationTime = decoded.exp;
  // Tiempo restante en segundos
  const timeUntilExpiration = expirationTime - currentTime;
  // Refrescar si faltan 5 minutos o menos (300 segundos)
  const refreshThreshold = 300;

  return timeUntilExpiration <= refreshThreshold;
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  const router = inject(Router);
  const authService = inject(AuthService);
  const storageService = inject(StorageService);
  
  // No interceptar las llamadas al endpoint de token
  if (req.url.includes('/token/')) {
    return next(req);
  }
  
  let accessToken: string | null = null;
  let refreshToken: string | null = null;
  
  if (isPlatformBrowser(platformId)) {
    accessToken = storageService.getItem('access_token');
    refreshToken = storageService.getItem('refresh_token');
  }
  
  if (!accessToken) {
    if (isPlatformBrowser(platformId)) {
      storageService.clear();
      router.navigate(['/login']);
    }
    return throwError(() => new Error('No authentication token available'));
  }

  // Si el token ya expiró, intentar refrescar o redirigir al login
  if (isTokenExpired(accessToken)) {
    if (isPlatformBrowser(platformId)) {
      // Si hay refresh token, intentar refrescar
      if (refreshToken) {
        return authService.refreshToken({ refresh: refreshToken }).pipe(
          switchMap((response) => {
            // Guardar el nuevo access token
            if (response.access) {
              storageService.setItem('access_token', response.access);
            }
            
            // Clonar la petición original con el nuevo token
            const clonedRequest = req.clone({
              setHeaders: {
                Authorization: `Bearer ${response.access}`
              }
            });
            
            return next(clonedRequest);
          }),
          catchError((error: HttpErrorResponse) => {
            // Si el refresh falla, limpiar todo y redirigir al login
            storageService.clear();
            router.navigate(['/login']);
            return throwError(() => error);
          })
        );
      } else {
        // No hay refresh token, redirigir al login
        storageService.clear();
        router.navigate(['/login']);
        return throwError(() => new Error('Token expired and no refresh token available'));
      }
    }
    return throwError(() => new Error('Token expired'));
  }
  
  if (isTokenExpiringSoon(accessToken) && refreshToken) {
    // Intentar refrescar el token antes de hacer la petición
    return authService.refreshToken({ refresh: refreshToken }).pipe(
      switchMap((response) => {
        // Guardar el nuevo access token
        if (isPlatformBrowser(platformId) && response.access) {
          storageService.setItem('access_token', response.access);
        }
        
        // Clonar la petición original con el nuevo token
        const clonedRequest = req.clone({
          setHeaders: {
            Authorization: `Bearer ${response.access}`
          }
        });
        
        return next(clonedRequest);
      }),
      catchError((error: HttpErrorResponse) => {
        // Si el refresh falla, limpiar todo y redirigir al login
        if (isPlatformBrowser(platformId)) {
          storageService.clear();
          router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
  
  // Si el token es válido, agregarlo a la petición
  const clonedRequest = req.clone({
    setHeaders: {
      Authorization: `Bearer ${accessToken}`
    }
  });
  
  return next(clonedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si recibimos un 401, intentar refrescar el token
      if (error.status === 401 && refreshToken && isPlatformBrowser(platformId)) {
        return authService.refreshToken({ refresh: refreshToken }).pipe(
          switchMap((response) => {
            // Guardar el nuevo access token
            storageService.setItem('access_token', response.access);
            
            // Reintentar la petición original con el nuevo token
            const retryRequest = req.clone({
              setHeaders: {
                Authorization: `Bearer ${response.access}`
              }
            });
            
            return next(retryRequest);
          }),
          catchError((refreshError) => {
            // Si el refresh falla, limpiar todo y redirigir al login
            storageService.clear();
            router.navigate(['/login']);
            return throwError(() => refreshError);
          })
        );
      }
      
      // Si no hay refresh token o el refresh falla, desloguear
      if (error.status === 401 && isPlatformBrowser(platformId)) {
        storageService.clear();
        router.navigate(['/login']);
      }
      
      return throwError(() => error);
    })
  );
};
