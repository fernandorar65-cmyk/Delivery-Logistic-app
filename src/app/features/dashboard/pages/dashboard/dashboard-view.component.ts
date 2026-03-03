import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProviderService } from '@app/features/providers/services/provider.service';
import { CompanyService } from '@app/features/companies/services/company.service';
import { ClientService } from '@app/features/clients/services/client.service';
import { StorageService } from '@app/core/storage/storage.service';
import { LocalStorageEnums } from '@app/shared/models/local.storage.enums';
import { Shipment } from './dashboard-view.types';
import { DashboardMetricsComponent, DashboardKpiCard } from './components/dashboard-metrics/dashboard-metrics.component';
import { DashboardShipmentsTabsComponent, DashboardTab } from './components/dashboard-shipments-tabs/dashboard-shipments-tabs.component';
import { DashboardShipmentsTableComponent } from './components/dashboard-shipments-table/dashboard-shipments-table.component';
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

  // Tarjetas KPI (diseño tipo Marketing Dashboard)
  periodOptions = [
    { label: 'Diario', value: 'day' },
    { label: 'Semanal', value: 'week' },
    { label: 'Mensual', value: 'month' }
  ];
  kpiCards = signal<DashboardKpiCard[]>([
    {
      title: 'Total Envíos',
      value: '2.847',
      changePercent: 18,
      changePositive: true,
      periodOption: { label: 'Semanal', value: 'week' },
      chartLabels: ['14 Oct', '15 Oct', '16 Oct', '17 Oct', '18 Oct', '19 Oct', '20 Oct', '21 Oct', '22 Oct', '23 Oct', '24 Oct', '25 Oct', '26 Oct', '27 Oct', '28 Oct', '29 Oct', '30 Oct', '31 Oct', '1 Nov', '2 Nov'],
      chartData: [120, 380, 620, 280, 510, 720, 400, 590, 350, 640, 290, 530, 680, 320, 490, 610, 410, 570, 380, 592],
      chartColor: '99, 102, 241',
      chartDataByPeriod: {
        day: {
          labels: ['20 Oct', '21 Oct', '22 Oct', '23 Oct', '24 Oct', '25 Oct', '26 Oct', '27 Oct', '28 Oct', '29 Oct', '30 Oct', '31 Oct', '1 Nov', '2 Nov'],
          data: [85, 142, 198, 165, 220, 178, 245, 190, 268, 312, 275, 340, 298, 592]
        },
        week: {
          labels: ['14 Oct', '15 Oct', '16 Oct', '17 Oct', '18 Oct', '19 Oct', '20 Oct', '21 Oct', '22 Oct', '23 Oct', '24 Oct', '25 Oct', '26 Oct', '27 Oct', '28 Oct', '29 Oct', '30 Oct', '31 Oct', '1 Nov', '2 Nov'],
          data: [120, 380, 620, 280, 510, 720, 400, 590, 350, 640, 290, 530, 680, 320, 490, 610, 410, 570, 380, 592]
        },
        month: {
          labels: ['May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov'],
          data: [1820, 2150, 1980, 2340, 2480, 2620, 2847]
        }
      }
    },
    {
      title: 'Valor promedio orden',
      value: '$1.892',
      changePercent: 5,
      changePositive: false,
      periodOption: { label: 'Semanal', value: 'week' },
      chartLabels: ['14 Oct', '15 Oct', '16 Oct', '17 Oct', '18 Oct', '19 Oct', '20 Oct', '21 Oct', '22 Oct', '23 Oct', '24 Oct', '25 Oct', '26 Oct', '27 Oct', '28 Oct', '29 Oct', '30 Oct', '31 Oct', '1 Nov', '2 Nov'],
      chartData: [2420, 2280, 2150, 2050, 1980, 1880, 1780, 1680, 1620, 1580, 1650, 1780, 1850, 1920, 1880, 1980, 2050, 2020, 1950, 1892],
      chartColor: '239, 68, 68',
      chartDataByPeriod: {
        day: {
          labels: ['20 Oct', '21 Oct', '22 Oct', '23 Oct', '24 Oct', '25 Oct', '26 Oct', '27 Oct', '28 Oct', '29 Oct', '30 Oct', '31 Oct', '1 Nov', '2 Nov'],
          data: [2100, 2050, 1980, 1920, 1880, 1820, 1780, 1720, 1680, 1650, 1620, 1680, 1750, 1892]
        },
        week: {
          labels: ['14 Oct', '15 Oct', '16 Oct', '17 Oct', '18 Oct', '19 Oct', '20 Oct', '21 Oct', '22 Oct', '23 Oct', '24 Oct', '25 Oct', '26 Oct', '27 Oct', '28 Oct', '29 Oct', '30 Oct', '31 Oct', '1 Nov', '2 Nov'],
          data: [2420, 2280, 2150, 2050, 1980, 1880, 1780, 1680, 1620, 1580, 1650, 1780, 1850, 1920, 1880, 1980, 2050, 2020, 1950, 1892]
        },
        month: {
          labels: ['May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov'],
          data: [2150, 2080, 2020, 1980, 1950, 1920, 1892]
        }
      }
    },
    {
      title: 'Entregas exitosas',
      value: '31.204',
      changePercent: 24,
      changePositive: true,
      periodOption: { label: 'Semanal', value: 'week' },
      chartLabels: ['14 Oct', '15 Oct', '16 Oct', '17 Oct', '18 Oct', '19 Oct', '20 Oct', '21 Oct', '22 Oct', '23 Oct', '24 Oct', '25 Oct', '26 Oct', '27 Oct', '28 Oct', '29 Oct', '30 Oct', '31 Oct', '1 Nov', '2 Nov'],
      chartData: [2650, 3100, 3480, 3280, 3720, 4080, 3850, 4250, 4550, 4320, 4680, 5020, 4780, 5180, 5450, 5220, 5380, 5650, 5780, 5924],
      chartColor: '34, 197, 94',
      chartDataByPeriod: {
        day: {
          labels: ['20 Oct', '21 Oct', '22 Oct', '23 Oct', '24 Oct', '25 Oct', '26 Oct', '27 Oct', '28 Oct', '29 Oct', '30 Oct', '31 Oct', '1 Nov', '2 Nov'],
          data: [2850, 3020, 3180, 3080, 3320, 3580, 3420, 3680, 3920, 4150, 3980, 4280, 4520, 5924]
        },
        week: {
          labels: ['14 Oct', '15 Oct', '16 Oct', '17 Oct', '18 Oct', '19 Oct', '20 Oct', '21 Oct', '22 Oct', '23 Oct', '24 Oct', '25 Oct', '26 Oct', '27 Oct', '28 Oct', '29 Oct', '30 Oct', '31 Oct', '1 Nov', '2 Nov'],
          data: [2650, 3100, 3480, 3280, 3720, 4080, 3850, 4250, 4550, 4320, 4680, 5020, 4780, 5180, 5450, 5220, 5380, 5650, 5780, 5924]
        },
        month: {
          labels: ['May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov'],
          data: [24500, 26200, 25800, 27200, 28500, 29800, 31204]
        }
      }
    }
  ]);

  selectedPeriod: { label: string; value: string } = { label: 'Última semana', value: 'week' };
  tablePeriodOptions = [
    { label: 'Última semana', value: 'week' },
    { label: 'Último mes', value: 'month' }
  ];

  // Paginación tabla
  tablePage = signal(1);
  tableRows = 5;
  totalShipmentsCount = signal(12);

  // Datos de envíos
  shipments = signal<Shipment[]>([]);
  loading = signal(false);

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
    { name: 'TechCorp Inc.', detail: 'Premium · 24 envíos', value: '2.840', initials: 'TC' },
    { name: 'AutoMotors S.A.', detail: 'Standard · 18 envíos', value: '1.620', initials: 'AM' },
    { name: 'RetailGroup', detail: 'Recurrente · 14 envíos', value: '1.190', initials: 'RT' },
    { name: 'SuperBites', detail: 'Express · 9 envíos', value: '890', initials: 'SB' },
    { name: 'ElectroLife', detail: 'Premium · 7 envíos', value: '756', initials: 'EL' }
  ]);

  constructor() {
    this.loadShipments();
    this.setIdUser();
  }

  loadShipments() {
    this.loading.set(true);
    this.shipments.set([
      {
        id: 'LOG-9281',
        client: { name: 'TechCorp Inc.', type: 'Premium', avatar: 'TC', email: 'contact@techcorp.com' },
        destination: 'Av. Reforma 222, CDMX',
        eta: 'Hoy, 14:30',
        vehicle: { name: 'Van 04', plate: 'XJ-92-11' },
        status: 'in-route',
        statusText: 'En Ruta',
        date: '3 Mar 2025',
        revenue: 89
      },
      {
        id: 'LOG-9284',
        client: { name: 'AutoMotors S.A.', type: 'Standard', avatar: 'AM', email: 'info@automotors.com' },
        destination: 'Calle 10, Monterrey',
        eta: 'Retrasado',
        vehicle: { name: 'Camión 02', plate: 'NL-45-22' },
        status: 'incident',
        statusText: 'Avería',
        date: '2 Mar 2025',
        revenue: null
      },
      {
        id: 'LOG-9290',
        client: { name: 'RetailGroup', avatar: 'RT', email: 'retail@group.com' },
        destination: 'Insurgentes Sur 1234, CDMX',
        eta: 'Mañana, 09:00',
        vehicle: null,
        status: 'pending',
        statusText: 'Pendiente',
        date: '4 Mar 2025',
        revenue: 156
      },
      {
        id: 'LOG-9275',
        client: { name: 'SuperBites', type: 'Recurrente', avatar: 'SB', email: 'super@bites.com' },
        destination: 'Polanco V, CDMX',
        eta: 'Entregado 12:15',
        vehicle: { name: 'Moto 11', plate: 'CDM-78-90' },
        status: 'delivered',
        statusText: 'Entregado',
        date: '1 Mar 2025',
        revenue: 45
      },
      {
        id: 'LOG-9270',
        client: { name: 'ElectroLife', avatar: 'EL', email: 'electro@life.com' },
        destination: 'Zona Ind., Guadalajara',
        eta: 'Mañana, 10:00',
        vehicle: { name: 'Trailer T-05', plate: 'JAL-12-34' },
        status: 'in-route',
        statusText: 'En Ruta',
        date: '3 Mar 2025',
        revenue: 320
      },
      {
        id: 'LOG-9265',
        client: { name: 'FarmaPlus', type: 'Express', avatar: 'FP', email: 'logistica@farmaplus.mx' },
        destination: 'Av. Universidad 550, CDMX',
        eta: 'Hoy, 16:00',
        vehicle: { name: 'Van 07', plate: 'XJ-33-88' },
        status: 'in-route',
        statusText: 'En Ruta',
        date: '3 Mar 2025',
        revenue: 78
      },
      {
        id: 'LOG-9260',
        client: { name: 'ConstruMex', avatar: 'CM', email: 'pedidos@construmex.com' },
        destination: 'Parque Ind. Querétaro',
        eta: '4 Mar, 08:00',
        vehicle: { name: 'Camión 01', plate: 'QRO-56-78' },
        status: 'pending',
        statusText: 'Pendiente',
        date: '2 Mar 2025',
        revenue: 410
      },
      {
        id: 'LOG-9255',
        client: { name: 'ModaStore', type: 'Standard', avatar: 'MS', email: 'envios@modastore.com' },
        destination: 'Galerías Monterrey',
        eta: 'Entregado 11:20',
        vehicle: { name: 'Moto 03' },
        status: 'delivered',
        statusText: 'Entregado',
        date: '28 Feb 2025',
        revenue: 62
      },
      {
        id: 'LOG-9250',
        client: { name: 'Alimentos del Norte', avatar: 'AN', email: 'norte@alimentos.mx' },
        destination: 'Saltillo, Coah.',
        eta: 'Retrasado — revisión',
        vehicle: { name: 'Refri 02', plate: 'COA-99-11' },
        status: 'incident',
        statusText: 'Incidente',
        date: '1 Mar 2025',
        revenue: null
      },
      {
        id: 'LOG-9245',
        client: { name: 'TechCorp Inc.', type: 'Premium', avatar: 'TC', email: 'contact@techcorp.com' },
        destination: 'Santa Fe, CDMX',
        eta: 'Entregado 09:45',
        vehicle: { name: 'Van 04' },
        status: 'delivered',
        statusText: 'Entregado',
        date: '27 Feb 2025',
        revenue: 134
      },
      {
        id: 'LOG-9240',
        client: { name: 'RetailGroup', avatar: 'RT', email: 'retail@group.com' },
        destination: 'Puebla Centro',
        eta: 'Mañana, 14:00',
        vehicle: null,
        status: 'pending',
        statusText: 'Pendiente',
        date: '4 Mar 2025',
        revenue: 95
      },
      {
        id: 'LOG-9235',
        client: { name: 'ElectroLife', avatar: 'EL', email: 'electro@life.com' },
        destination: 'Toluca, Méx.',
        eta: 'Hoy, 18:30',
        vehicle: { name: 'Van 12', plate: 'MEX-22-44' },
        status: 'in-route',
        statusText: 'En Ruta',
        date: '3 Mar 2025',
        revenue: 278
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
    if (this.tablePage() > 1) {
      this.tablePage.set(this.tablePage() - 1);
    }
  }

  goToNextPage() {
    const totalPages = Math.ceil(this.totalShipmentsCount() / this.tableRows);
    if (this.tablePage() < totalPages) {
      this.tablePage.set(this.tablePage() + 1);
    }
  }

  goToFirstPage() {
    this.tablePage.set(1);
  }

  goToLastPage() {
    this.tablePage.set(this.getTotalPages());
  }

  getTotalPages(): number {
    return Math.ceil(this.totalShipmentsCount() / this.tableRows) || 1;
  }
}







