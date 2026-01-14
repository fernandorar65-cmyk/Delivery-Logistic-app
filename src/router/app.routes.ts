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
        loadComponent: () => import('../app/views/allies/ally-list-view/ally-list-view.component')
          .then(m => m.AllyListViewComponent)
      },
      {
        path: 'allies/:allyId/vehicles',
        loadComponent: () => import('../app/views/vehicles/vehicle-list-view/vehicle-list-view.component')
          .then(m => m.VehicleListViewComponent)
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
        path: 'drivers',
        loadComponent: () => import('../app/views/drivers/driver-list-view/driver-list-view.component')
          .then(m => m.DriverListViewComponent)
      },
      {
        path: 'drivers/new',
        loadComponent: () => import('../app/views/drivers/driver-form-view/driver-form-view.component')
          .then(m => m.DriverFormViewComponent)
      },
      {
        path: 'drivers/:id',
        loadComponent: () => import('../app/views/drivers/driver-detail-view/driver-detail-view.component')
          .then(m => m.DriverDetailViewComponent)
      },
      {
        path: 'drivers/:id/edit',
        loadComponent: () => import('../app/views/drivers/driver-form-view/driver-form-view.component')
          .then(m => m.DriverFormViewComponent)
      },
      {
        path: 'internal-clients',
        loadComponent: () => import('../app/views/internal-clients/internal-client-list-view/internal-client-list-view.component')
          .then(m => m.InternalClientListViewComponent)
      },
      {
        path: 'internal-clients/new',
        loadComponent: () => import('../app/views/internal-clients/internal-client-form-view/internal-client-form-view.component')
          .then(m => m.InternalClientFormViewComponent)
      },
      {
        path: 'internal-clients/:id',
        loadComponent: () => import('../app/views/internal-clients/internal-client-detail-view/internal-client-detail-view.component')
          .then(m => m.InternalClientDetailViewComponent)
      },
      {
        path: 'internal-clients/:id/edit',
        loadComponent: () => import('../app/views/internal-clients/internal-client-form-view/internal-client-form-view.component')
          .then(m => m.InternalClientFormViewComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('../app/views/users/user-list-view/user-list-view.component')
          .then(m => m.UserListViewComponent)
      },
      {
        path: 'users/new',
        loadComponent: () => import('../app/views/users/user-form-view/user-form-view.component')
          .then(m => m.UserFormViewComponent)
      },
      {
        path: 'users/:id',
        loadComponent: () => import('../app/views/users/user-detail-view/user-detail-view.component')
          .then(m => m.UserDetailViewComponent)
      },
      {
        path: 'users/:id/edit',
        loadComponent: () => import('../app/views/users/user-form-view/user-form-view.component')
          .then(m => m.UserFormViewComponent)
      },
      {
        path: 'operations',
        loadComponent: () => import('../app/views/operations/operation-list-view/operation-list-view.component')
          .then(m => m.OperationListViewComponent)
      },
      {
        path: 'operations/new',
        loadComponent: () => import('../app/views/operations/operation-form-view/operation-form-view.component')
          .then(m => m.OperationFormViewComponent)
      },
      {
        path: 'operations/:id',
        loadComponent: () => import('../app/views/operations/operation-detail-view/operation-detail-view.component')
          .then(m => m.OperationDetailViewComponent)
      },
      {
        path: 'operations/:id/edit',
        loadComponent: () => import('../app/views/operations/operation-form-view/operation-form-view.component')
          .then(m => m.OperationFormViewComponent)
      },
      {
        path: 'orders',
        loadComponent: () => import('../app/views/orders/order-list-view/order-list-view.component')
          .then(m => m.OrderListViewComponent)
      },
      {
        path: 'orders/new',
        loadComponent: () => import('../app/views/orders/order-form-view/order-form-view.component')
          .then(m => m.OrderFormViewComponent)
      },
      {
        path: 'orders/:id',
        loadComponent: () => import('../app/views/orders/order-detail-view/order-detail-view.component')
          .then(m => m.OrderDetailViewComponent)
      },
      {
        path: 'orders/:id/edit',
        loadComponent: () => import('../app/views/orders/order-form-view/order-form-view.component')
          .then(m => m.OrderFormViewComponent)
      },
      {
        path: 'orders/assignment',
        loadComponent: () => import('../app/views/orders/order-assignment-view/order-assignment-view.component')
          .then(m => m.OrderAssignmentViewComponent)
      },
      {
        path: '',
        redirectTo: '/dashboard',
        pathMatch: 'full'
      }
    ]
  }
];
