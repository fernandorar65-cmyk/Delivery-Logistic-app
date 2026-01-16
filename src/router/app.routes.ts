import { Routes } from '@angular/router';
// Componentes que se cargan siempre (eager loading)
import { LoginViewComponent } from '../app/views/login/login-view.component';
import { MainLayoutComponent } from '../app/layouts/main-layout/main-layout.component';
import { authGuard } from '../app/guards/auth.guard';
import { guestGuard } from '../app/guards/guest.guard';

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
        loadComponent: () => import('../app/views/dashboard/dashboard-view.component')
          .then(m => m.DashboardViewComponent)
      },
      {
        path: 'allies',
        loadComponent: () => import('../app/views/providers/providers-list-view/providers-list-view.component')
          .then(m => m.AllyListViewComponent)
      },
      {
        path: 'allies/:allyId/vehicles',
        loadComponent: () => import('../app/views/vehicles/vehicle-list-view/vehicle-list-view.component')
          .then(m => m.VehicleListViewComponent)
      },
      {
        path: 'allies/:allyId/vehicles/:vehicleId',
        loadComponent: () => import('../app/views/vehicles/vehicle-detail-view/vehicle-detail-view.component')
          .then(m => m.VehicleDetailViewComponent)
      },
      {
        path: 'companies',
        loadComponent: () => import('../app/views/companies/company-list-view/company-list-view.component')
          .then(m => m.CompanyListViewComponent)
      },
      {
        path: 'clients',
        loadComponent: () => import('../app/views/clients/client-list-view/client-list-view.component')
          .then(m => m.ClientListViewComponent)
      },
      {
        path: 'clients/new',
        loadComponent: () => import('../app/views/clients/client-form-view/client-form-view.component')
          .then(m => m.ClientFormViewComponent)
      },
      {
        path: 'clients/:id',
        loadComponent: () => import('../app/views/clients/client-detail-view/client-detail-view.component')
          .then(m => m.ClientDetailViewComponent)
      },
      {
        path: 'clients/:id/edit',
        loadComponent: () => import('../app/views/clients/client-form-view/client-form-view.component')
          .then(m => m.ClientFormViewComponent)
      },
      {
        path: '',
        redirectTo: '/dashboard',
        pathMatch: 'full'
      }
    ]
  }
];
