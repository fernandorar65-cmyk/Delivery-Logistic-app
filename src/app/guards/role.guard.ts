import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { StorageService } from '../services/storage.service';
import { LocalStorageEnums } from '../models/local.storage.enums';

type RouteRole = string;

const getAllowedRoles = (route: Parameters<CanActivateFn>[0]): RouteRole[] | null => {
  const roles = route.data?.['roles'] as RouteRole[] | undefined;
  return roles?.length ? roles : null;
};

const normalizeRole = (role: string): string => {
  const map: Record<string, string> = {
    platform: 'admin'
  };
  return map[role] ?? role;
};

export const roleGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const storageService = inject(StorageService);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    // En SSR no validamos roles.
    return true;
  }

  const allowedRoles = getAllowedRoles(route);
  if (!allowedRoles) {
    return true;
  }

  const rawUserType = storageService.getItem(LocalStorageEnums.USER_TYPE);
  if (!rawUserType) {
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url }
    });
  }

  const normalizedUserType = normalizeRole(rawUserType);
  if (!allowedRoles.includes(normalizedUserType)) {
    return router.createUrlTree(['/dashboard']);
  }

  return true;
};
