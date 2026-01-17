import { Routes } from '@angular/router';
// Componentes que se cargan siempre (eager loading)
import { LoginViewComponent } from '../app/views/auth/login/login-view.component';
import { MainLayoutComponent } from '../app/layouts/main-layout/main-layout.component';
import { authGuard } from '../app/guards/auth.guard';
import { guestGuard } from '../app/guards/guest.guard';
import { roleGuard } from '../app/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginViewComponent,
    canActivate: [guestGuard]
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('../app/views/providers/dashboard/dashboard-view.component')
          .then(m => m.DashboardViewComponent)
      },
      {
        path: 'providers',
        canActivate: [roleGuard],
        data: { roles: ['admin'] },
        loadComponent: () => import('../app/views/admin/providers-list-view/providers-list-view.component')
          .then(m => m.AllyListViewComponent)
      },
      {
        path: 'allies',
        canActivate: [roleGuard],
        data: { roles: ['admin'] },
        loadComponent: () => import('../app/views/admin/providers-list-view/providers-list-view.component')
          .then(m => m.AllyListViewComponent)
      },
      {
        path: 'allies/:allyId/vehicles',
        canActivate: [roleGuard],
        data: { roles: ['admin', 'provider'] },
        loadComponent: () => import('../app/views/providers/vehicles/vehicle-list-view/vehicle-list-view.component')
          .then(m => m.VehicleListViewComponent)
      },
      {
        path: 'allies/:allyId/vehicles/:vehicleId',
        canActivate: [roleGuard],
        data: { roles: ['admin', 'provider'] },
        loadComponent: () => import('../app/views/providers/vehicles/vehicle-detail-view/vehicle-detail-view.component')
          .then(m => m.VehicleDetailViewComponent)
      },
      {
        path: 'companies',
        canActivate: [roleGuard],
        data: { roles: ['admin'] },
        loadComponent: () => import('../app/views/admin/company-list-view/company-list-view.component')
          .then(m => m.CompanyListViewComponent)
      },
      {
        path: 'clients',
        canActivate: [roleGuard],
        data: { roles: ['admin'] },
        loadComponent: () => import('../app/views/admin/client-list-view/client-list-view.component')
          .then(m => m.ClientListViewComponent)
      },
      {
        path: 'clients/:id',
        canActivate: [roleGuard],
        data: { roles: ['admin'] },
        loadComponent: () => import('../app/views/admin/client-detail-view/client-detail-view.component')
          .then(m => m.ClientDetailViewComponent)
      },
      {
        path: '',
        redirectTo: '/dashboard',
        pathMatch: 'full'
      }
    ]
  }
];
