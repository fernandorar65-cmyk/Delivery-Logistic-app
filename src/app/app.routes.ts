import { Routes } from '@angular/router';
// Componentes que se cargan siempre (eager loading)
import { LoginViewComponent } from './views/login/login-view.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginViewComponent
  },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./views/dashboard/dashboard-view.component')
          .then(m => m.DashboardViewComponent)
      },
      {
        path: 'clients',
        loadComponent: () => import('./views/clients/client-list-view/client-list-view.component')
          .then(m => m.ClientListViewComponent)
      },
      {
        path: 'clients/new',
        loadComponent: () => import('./views/clients/client-form-view/client-form-view.component')
          .then(m => m.ClientFormViewComponent)
      },
      {
        path: 'clients/:id',
        loadComponent: () => import('./views/clients/client-detail-view/client-detail-view.component')
          .then(m => m.ClientDetailViewComponent)
      },
      {
        path: 'clients/:id/edit',
        loadComponent: () => import('./views/clients/client-form-view/client-form-view.component')
          .then(m => m.ClientFormViewComponent)
      },
      {
        path: 'drivers',
        loadComponent: () => import('./views/drivers/driver-list-view/driver-list-view.component')
          .then(m => m.DriverListViewComponent)
      },
      {
        path: 'drivers/new',
        loadComponent: () => import('./views/drivers/driver-form-view/driver-form-view.component')
          .then(m => m.DriverFormViewComponent)
      },
      {
        path: 'drivers/:id',
        loadComponent: () => import('./views/drivers/driver-detail-view/driver-detail-view.component')
          .then(m => m.DriverDetailViewComponent)
      },
      {
        path: 'drivers/:id/edit',
        loadComponent: () => import('./views/drivers/driver-form-view/driver-form-view.component')
          .then(m => m.DriverFormViewComponent)
      },
      {
        path: 'internal-clients',
        loadComponent: () => import('./views/internal-clients/internal-client-list-view/internal-client-list-view.component')
          .then(m => m.InternalClientListViewComponent)
      },
      {
        path: 'internal-clients/new',
        loadComponent: () => import('./views/internal-clients/internal-client-form-view/internal-client-form-view.component')
          .then(m => m.InternalClientFormViewComponent)
      },
      {
        path: 'internal-clients/:id',
        loadComponent: () => import('./views/internal-clients/internal-client-detail-view/internal-client-detail-view.component')
          .then(m => m.InternalClientDetailViewComponent)
      },
      {
        path: 'internal-clients/:id/edit',
        loadComponent: () => import('./views/internal-clients/internal-client-form-view/internal-client-form-view.component')
          .then(m => m.InternalClientFormViewComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./views/users/user-list-view/user-list-view.component')
          .then(m => m.UserListViewComponent)
      },
      {
        path: 'users/new',
        loadComponent: () => import('./views/users/user-form-view/user-form-view.component')
          .then(m => m.UserFormViewComponent)
      },
      {
        path: 'users/:id',
        loadComponent: () => import('./views/users/user-detail-view/user-detail-view.component')
          .then(m => m.UserDetailViewComponent)
      },
      {
        path: 'users/:id/edit',
        loadComponent: () => import('./views/users/user-form-view/user-form-view.component')
          .then(m => m.UserFormViewComponent)
      },
      {
        path: 'operations',
        loadComponent: () => import('./views/operations/operation-list-view/operation-list-view.component')
          .then(m => m.OperationListViewComponent)
      },
      {
        path: 'operations/new',
        loadComponent: () => import('./views/operations/operation-form-view/operation-form-view.component')
          .then(m => m.OperationFormViewComponent)
      },
      {
        path: 'operations/:id',
        loadComponent: () => import('./views/operations/operation-detail-view/operation-detail-view.component')
          .then(m => m.OperationDetailViewComponent)
      },
      {
        path: 'operations/:id/edit',
        loadComponent: () => import('./views/operations/operation-form-view/operation-form-view.component')
          .then(m => m.OperationFormViewComponent)
      },
      {
        path: 'orders',
        loadComponent: () => import('./views/orders/order-list-view/order-list-view.component')
          .then(m => m.OrderListViewComponent)
      },
      {
        path: 'orders/new',
        loadComponent: () => import('./views/orders/order-form-view/order-form-view.component')
          .then(m => m.OrderFormViewComponent)
      },
      {
        path: 'orders/:id',
        loadComponent: () => import('./views/orders/order-detail-view/order-detail-view.component')
          .then(m => m.OrderDetailViewComponent)
      },
      {
        path: 'orders/:id/edit',
        loadComponent: () => import('./views/orders/order-form-view/order-form-view.component')
          .then(m => m.OrderFormViewComponent)
      },
      {
        path: '',
        redirectTo: '/dashboard',
        pathMatch: 'full'
      }
    ]
  }
];
