import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/user.service';
import { StorageService } from '../../../services/storage.service';
import { LocalStorageEnums } from '../../../models/local.storage.enums';
import { Shipment } from './dashboard-view.types';
import { DashboardMetricsComponent } from './components/dashboard-metrics/dashboard-metrics.component';
import { DashboardShipmentsHeaderComponent } from './components/dashboard-shipments-header/dashboard-shipments-header.component';
import { DashboardShipmentsTabsComponent, DashboardTab } from './components/dashboard-shipments-tabs/dashboard-shipments-tabs.component';
import { DashboardShipmentsTableComponent } from './components/dashboard-shipments-table/dashboard-shipments-table.component';
import { DashboardPaginationComponent } from './components/dashboard-pagination/dashboard-pagination.component';

@Component({
  selector: 'app-dashboard-view',
  standalone: true,
  imports: [
    CommonModule,
    DashboardMetricsComponent,
    DashboardShipmentsHeaderComponent,
    DashboardShipmentsTabsComponent,
    DashboardShipmentsTableComponent,
    DashboardPaginationComponent
  ],
  templateUrl: './dashboard-view.component.html',
  styleUrl: './dashboard-view.component.css'
})
export class DashboardViewComponent {
  private userService = inject(UserService);
  private storageService = inject(StorageService);

  // Estado de tabs
  activeTab = signal<DashboardTab>('all');

  // Métricas del dashboard según la imagen
  totalShipments = signal(1240);
  totalShipmentsChange = signal({ value: 5, isPositive: true });
  
  deliveredSuccess = signal(85);
  deliveredSuccessChange = signal({ value: 2, isPositive: true });
  
  awaitingAssignment = signal(45);
  activeIncidents = signal(3);
  activeIncidentsChange = signal({ value: 10, isPositive: false });

  // Datos de envíos
  shipments = signal<Shipment[]>([]);
  loading = signal(false);
  currentPage = signal(1);
  totalShipmentsCount = signal(128);

  constructor() {
    this.loadShipments();
    this.setIdUser();
  }

  loadShipments() {




    this.loading.set(true);
    // Simular datos según la imagen
    this.shipments.set([
      {
        id: 'LOG-9281',
        client: { name: 'TechCorp Inc.', type: 'Premium', avatar: 'TC' },
        destination: 'Av. Reforma 222, CDMX',
        eta: 'Hoy, 14:30 PM',
        vehicle: { name: 'Van 04', plate: 'XJ-92-11' },
        status: 'in-route',
        statusText: 'En Ruta'
      },
      {
        id: 'LOG-9284',
        client: { name: 'AutoMotors', type: 'Standard', avatar: 'AM' },
        destination: 'Calle 10, Monterrey',
        eta: 'Retrasado',
        vehicle: { name: 'Camión 02' },
        status: 'incident',
        statusText: 'Avería'
      },
      {
        id: 'LOG-9290',
        client: { name: 'RetailGroup', avatar: 'RT' },
        destination: 'Insurgentes Sur, CDMX',
        eta: 'Mañana, 09:00 AM',
        vehicle: null,
        status: 'pending',
        statusText: 'Pendiente'
      },
      {
        id: 'LOG-9275',
        client: { name: 'SuperBites', type: 'Recurrente', avatar: 'SB' },
        destination: 'Polanco V, CDMX',
        eta: 'Entregado 12:15 PM',
        vehicle: { name: 'Moto 11' },
        status: 'delivered',
        statusText: 'Entregado'
      },
      {
        id: 'LOG-9270',
        client: { name: 'ElectroLife', avatar: 'EL' },
        destination: 'Zona Ind., Guadalajara',
        eta: 'Mañana, 10:00 AM',
        vehicle: { name: 'Trailer T-05' },
        status: 'in-route',
        statusText: 'En Ruta'
      }
    ]);
    this.loading.set(false);
  }

  setIdUser() {
    const email = this.storageService.getItem(LocalStorageEnums.USER_EMAIL);
    if (!email) {
      return;
    }
    this.userService.CheckUserEmail(email).subscribe({
      next: (userResponse) => {
        if (userResponse.errors && userResponse.errors.length > 0) {
          console.warn('No se pudo obtener el id del usuario.');
          return;
        }
        const result = userResponse?.result ?? null;
        if (result?.id) {
          this.storageService.setItem(LocalStorageEnums.USER_ID, result.id);
        }
        if (result) {
          this.storageService.setItem(LocalStorageEnums.USER_DATA, JSON.stringify(result));
        }
      },
      error: () => {
        console.warn('No se pudo obtener el id del usuario.');
      }
    });
  }

  setActiveTab(tab: DashboardTab) {
    this.activeTab.set(tab);
    this.loadShipments();
  }

  getFilteredShipments() {
    const tab = this.activeTab();
    if (tab === 'all') {
      return this.shipments();
    }
    return this.shipments().filter(s => s.status === tab);
  }

  getIncidentsCount() {
    return this.shipments().filter(s => s.status === 'incident').length;
  }

  goToPreviousPage() {
    if (this.currentPage() > 1) {
      this.currentPage.set(this.currentPage() - 1);
    }
  }

  goToNextPage() {
    if (this.currentPage() * 5 < this.totalShipmentsCount()) {
      this.currentPage.set(this.currentPage() + 1);
    }
  }
}

