import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProviderService } from '@app/features/providers/services/provider.service';
import { CompanyService } from '@app/features/companies/services/company.service';
import { ClientService } from '@app/features/clients/services/client.service';
import { StorageService } from '@app/core/storage/storage.service';
import { LocalStorageEnums } from '@app/shared/models/local.storage.enums';
import { Shipment } from './dashboard-view.types';
import { DashboardMetricsComponent } from './components/dashboard-metrics/dashboard-metrics.component';
import { DashboardShipmentsTabsComponent, DashboardTab } from './components/dashboard-shipments-tabs/dashboard-shipments-tabs.component';
import { DashboardShipmentsTableComponent } from './components/dashboard-shipments-table/dashboard-shipments-table.component';
import { PaginationComponent } from '@app/shared/ui/pagination/pagination.component';
import { hasApiErrors } from '@app/shared/utils/api-response';
import { normalizeUserType } from '@app/shared/models/user-types';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { SelectModule } from 'primeng/select';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-dashboard-view',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DashboardMetricsComponent,
    DashboardShipmentsTabsComponent,
    DashboardShipmentsTableComponent,
    PaginationComponent,
    CardModule,
    ChartModule,
    SelectModule,
    ToolbarModule,
    ButtonModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    AvatarModule,
    TooltipModule
  ],
  templateUrl: './dashboard-view.component.html',
  styleUrl: './dashboard-view.component.css'
})
export class DashboardViewComponent {
  private providerService = inject(ProviderService);
  private companyService = inject(CompanyService);
  private clientService = inject(ClientService);
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

  selectedPeriod: { label: string; value: string } = { label: 'Última semana', value: 'week' };
  periodOptions = [
    { label: 'Última semana', value: 'week' },
    { label: 'Último mes', value: 'month' }
  ];

  revenueChartData = {
    labels: ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'],
    datasets: [
      { label: 'Ingresos', data: [65, 59, 80, 81, 56, 55, 70], fill: false, backgroundColor: 'rgba(99, 102, 241, 0.8)', borderColor: 'rgb(99, 102, 241)' },
      { label: 'Beneficio', data: [28, 48, 40, 45, 32, 30, 38], fill: false, backgroundColor: 'rgba(139, 92, 246, 0.6)', borderColor: 'rgb(139, 92, 246)' }
    ]
  };
  revenueChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
    scales: { y: { beginAtZero: true } }
  };

  categoryChartData = {
    labels: ['Electrónica', 'Moda', 'Hogar'],
    datasets: [{ data: [54, 32, 14], backgroundColor: ['#6366f1', '#8b5cf6', '#a5b4fc'], hoverBackgroundColor: ['#4f46e5', '#7c3aed', '#818cf8'] }]
  };
  categoryChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } }
  };

  topProducts = signal<{ name: string; detail: string; value: string; initials: string }[]>([
    { name: 'TechCorp Inc.', detail: 'Premium · 12 envíos', value: '1240', initials: 'TC' },
    { name: 'AutoMotors', detail: 'Standard · 8 envíos', value: '856', initials: 'AM' },
    { name: 'RetailGroup', detail: 'Recurrente · 5 envíos', value: '520', initials: 'RT' }
  ]);

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
    const userType = this.storageService.getItem(LocalStorageEnums.USER_TYPE);
    if (!userType) {
      return;
    }

    const normalizedType = normalizeUserType(userType) ?? userType;

    if (normalizedType === 'provider') {
      this.providerService.getMe().subscribe({
        next: (response) => this.handleMeResponse(response),
        error: () => {
        }
      });
      return;
    }

    if (normalizedType === 'company') {
      this.companyService.getMe().subscribe({
        next: (response) => this.handleMeResponse(response),
        error: () => {
        }
      });
      return;
    }

    if (normalizedType === 'client') {
      this.clientService.getMe().subscribe({
        next: (response) => this.handleMeResponse(response),
        error: () => {
        }
      });
    }
  }

  private handleMeResponse(response: { errors: any[]; result: any }) {
    if (hasApiErrors(response)) {
      return;
    }
    const result = response?.result ?? null;
    if (!result) return;
    const entityId =
      result.id ?? result.client_id ?? result.company_id ?? result.provider_id ?? null;
    if (entityId != null) {
      this.storageService.setItem(LocalStorageEnums.USER_ID, result.user_id ?? '');
      this.storageService.setItem(LocalStorageEnums.ID, String(entityId));
    }
    if (result?.user_type) {
      this.storageService.setItem(LocalStorageEnums.USER_TYPE, result.user_type);
    }
    if (result?.user_email) {
      this.storageService.setItem(LocalStorageEnums.USER_EMAIL, result.user_email);
    }
    if (result) {
      this.storageService.setItem(LocalStorageEnums.USER_DATA, JSON.stringify(result));
    }
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







