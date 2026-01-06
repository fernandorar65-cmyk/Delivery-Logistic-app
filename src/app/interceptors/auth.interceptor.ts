import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  const router = inject(Router);
  
  let token: string | null = null;
  if (isPlatformBrowser(platformId)) {
    token = localStorage.getItem('access_token');
  }
  
  if (token) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonedRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        // Si recibimos un 401 Unauthorized, deslogueamos al usuario
        if (error.status === 401 && isPlatformBrowser(platformId)) {
          // Limpiar tokens
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          
          // Redirigir al login
          router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
  
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si recibimos un 401 Unauthorized, deslogueamos al usuario
      if (error.status === 401 && isPlatformBrowser(platformId)) {
        // Limpiar tokens por si acaso
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        
        // Redirigir al login
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};

