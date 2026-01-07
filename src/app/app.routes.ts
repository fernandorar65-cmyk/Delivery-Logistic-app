import { Routes } from '@angular/router';
import { ClientListViewComponent } from './views/clients/client-list-view/client-list-view.component';
import { ClientDetailViewComponent } from './views/clients/client-detail-view/client-detail-view.component';
import { ClientFormViewComponent } from './views/clients/client-form-view/client-form-view.component';
import { DriverListViewComponent } from './views/drivers/driver-list-view/driver-list-view.component';
import { DriverDetailViewComponent } from './views/drivers/driver-detail-view/driver-detail-view.component';
import { DriverFormViewComponent } from './views/drivers/driver-form-view/driver-form-view.component';
import { InternalClientListViewComponent } from './views/internal-clients/internal-client-list-view/internal-client-list-view.component';
import { InternalClientDetailViewComponent } from './views/internal-clients/internal-client-detail-view/internal-client-detail-view.component';
import { InternalClientFormViewComponent } from './views/internal-clients/internal-client-form-view/internal-client-form-view.component';
import { UserListViewComponent } from './views/users/user-list-view/user-list-view.component';
import { UserDetailViewComponent } from './views/users/user-detail-view/user-detail-view.component';
import { UserFormViewComponent } from './views/users/user-form-view/user-form-view.component';
import { OperationListViewComponent } from './views/operations/operation-list-view/operation-list-view.component';
import { OperationDetailViewComponent } from './views/operations/operation-detail-view/operation-detail-view.component';
import { OperationFormViewComponent } from './views/operations/operation-form-view/operation-form-view.component';
import { LoginViewComponent } from './views/login/login-view.component';
import { DashboardViewComponent } from './views/dashboard/dashboard-view.component';
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
        component: DashboardViewComponent
      },
      {
        path: 'clients',
        component: ClientListViewComponent
      },
      {
        path: 'clients/new',
        component: ClientFormViewComponent
      },
      {
        path: 'clients/:id',
        component: ClientDetailViewComponent
      },
      {
        path: 'clients/:id/edit',
        component: ClientFormViewComponent
      },
      {
        path: 'drivers',
        component: DriverListViewComponent
      },
      {
        path: 'drivers/new',
        component: DriverFormViewComponent
      },
      {
        path: 'drivers/:id',
        component: DriverDetailViewComponent
      },
      {
        path: 'drivers/:id/edit',
        component: DriverFormViewComponent
      },
      {
        path: 'internal-clients',
        component: InternalClientListViewComponent
      },
      {
        path: 'internal-clients/new',
        component: InternalClientFormViewComponent
      },
      {
        path: 'internal-clients/:id',
        component: InternalClientDetailViewComponent
      },
      {
        path: 'internal-clients/:id/edit',
        component: InternalClientFormViewComponent
      },
      {
        path: 'users',
        component: UserListViewComponent
      },
      {
        path: 'users/new',
        component: UserFormViewComponent
      },
      {
        path: 'users/:id',
        component: UserDetailViewComponent
      },
      {
        path: 'users/:id/edit',
        component: UserFormViewComponent
      },
      {
        path: 'operations',
        component: OperationListViewComponent
      },
      {
        path: 'operations/new',
        component: OperationFormViewComponent
      },
      {
        path: 'operations/:id',
        component: OperationDetailViewComponent
      },
      {
        path: 'operations/:id/edit',
        component: OperationFormViewComponent
      },
      {
        path: '',
        redirectTo: '/dashboard',
        pathMatch: 'full'
      }
    ]
  }
];
