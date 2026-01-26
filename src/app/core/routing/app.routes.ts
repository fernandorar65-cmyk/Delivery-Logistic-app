import { Routes } from '@angular/router';
// Componentes que se cargan siempre (eager loading)
import { LoginViewComponent } from '@app/features/auth/pages/login/login-view.component';
import { MainLayoutComponent } from '@app/core/layout/main-layout/main-layout.component';
import { ClientDetailViewComponent } from '@app/features/clients/pages/client-detail-view/client-detail-view.component';
import { authGuard } from '@app/core/guards/auth.guard';
import { guestGuard } from '@app/core/guards/guest.guard';
import { roleGuard } from '@app/core/guards/role.guard';

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
        loadComponent: () => import('@app/features/dashboard/pages/dashboard/dashboard-view.component')
          .then(m => m.DashboardViewComponent)
      },
      {
        path: 'providers',
        canActivate: [roleGuard],
        data: { roles: ['admin', 'company'] },
        loadComponent: () => import('@app/features/providers/pages/providers-list-view/providers-list-view.component')
          .then(m => m.AllyListViewComponent)
      },
      {
        path: 'providers/requests',
        canActivate: [roleGuard],
        data: { roles: ['admin', 'company', 'provider'] },
        loadComponent: () => import('@app/features/providers/pages/match-requests-view/match-requests-view.component')
          .then(m => m.MatchRequestsViewComponent)
      },
      {
        path: 'providers/orders',
        canActivate: [roleGuard],
        data: { roles: ['admin', 'provider'] },
        loadComponent: () => import('@app/features/providers/pages/provider-orders-view/provider-orders-view.component')
          .then(m => m.ProviderOrdersViewComponent)
      },
      {
        path: 'providers/companies',
        canActivate: [roleGuard],
        data: { roles: ['provider'] },
        loadComponent: () => import('@app/features/providers/pages/provider-companies-view/provider-companies-view.component')
          .then(m => m.ProviderCompaniesViewComponent)
      },
      {
        path: 'providers/usuarios-internos',
        canActivate: [roleGuard],
        data: { roles: ['admin', 'provider'], ownerType: 'provider' },
        loadComponent: () => import('@app/features/internal-users/pages/internal-users-view/internal-users-view.component')
          .then(m => m.InternalUsersViewComponent)
      },
      {
        path: 'allies',
        canActivate: [roleGuard],
        data: { roles: ['admin', 'company'] },
        loadComponent: () => import('@app/features/providers/pages/providers-list-view/providers-list-view.component')
          .then(m => m.AllyListViewComponent)
      },
      {
        path: 'allies/:allyId/vehicles',
        canActivate: [roleGuard],
        data: { roles: ['admin', 'provider'] },
        loadComponent: () => import('@app/features/vehicles/pages/vehicle-list-view/vehicle-list-view.component')
          .then(m => m.VehicleListViewComponent)
      },
      {
        path: 'allies/:allyId/vehicles/:vehicleId',
        canActivate: [roleGuard],
        data: { roles: ['admin', 'provider'] },
        loadComponent: () => import('@app/features/vehicles/pages/vehicle-detail-view/vehicle-detail-view.component')
          .then(m => m.VehicleDetailViewComponent)
      },
      {
        path: 'companies',
        canActivate: [roleGuard],
        data: { roles: ['admin'] },
        loadComponent: () => import('@app/features/companies/pages/company-list-view/company-list-view.component')
          .then(m => m.CompanyListViewComponent)
      },
      {
        path: 'companies/status-groups',
        canActivate: [roleGuard],
        data: { roles: ['company'] },
        loadComponent: () => import('@app/features/companies/pages/company-status-groups-view/company-status-groups-view.component')
          .then(m => m.CompanyStatusGroupsViewComponent)
      },
      {
        path: 'companies/status-groups/:groupId',
        canActivate: [roleGuard],
        data: { roles: ['company'] },
        loadComponent: () => import('@app/features/companies/pages/company-status-group-detail-view/company-status-group-detail-view.component')
          .then(m => m.CompanyStatusGroupDetailViewComponent)
      },
      {
        path: 'companies/:id/usuarios-internos',
        canActivate: [roleGuard],
        data: { roles: ['admin', 'company'], ownerType: 'company' },
        loadComponent: () => import('@app/features/internal-users/pages/internal-users-view/internal-users-view.component')
          .then(m => m.InternalUsersViewComponent)
      },
      {
        path: 'clients',
        canActivate: [roleGuard],
        data: { roles: ['admin', 'company'] },
        loadComponent: () => import('@app/features/clients/pages/client-list-view/client-list-view.component')
          .then(m => m.ClientListViewComponent)
      },
      {
        path: 'clients/:id',
        canActivate: [roleGuard],
        data: { roles: ['admin', 'company'] },
        component: ClientDetailViewComponent
      },
      {
        path: 'clients/:id/usuarios-internos',
        canActivate: [roleGuard],
        data: { roles: ['admin', 'company', 'client'], ownerType: 'client' },
        loadComponent: () => import('@app/features/internal-users/pages/internal-users-view/internal-users-view.component')
          .then(m => m.InternalUsersViewComponent)
      },
      {
        path: '',
        redirectTo: '/dashboard',
        pathMatch: 'full'
      }
    ]
  }
];






