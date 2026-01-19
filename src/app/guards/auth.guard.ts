import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { StorageService } from '../services/storage.service';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { LocalStorageEnums } from '../models/local.storage.enums';

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

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const storageService = inject(StorageService);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    // En el servidor, permitir la navegación (SSR)
    return true;
  }

  const accessToken = storageService.getItem(LocalStorageEnums.ACCESS_TOKEN);

  // Si no hay token o está expirado, redirigir al login
  if (!accessToken || isTokenExpired(accessToken)) {
    storageService.clear();
    router.navigate(['/login'], { 
      queryParams: { returnUrl: state.url } 
    });
    return false;
  }

  return true;
};
