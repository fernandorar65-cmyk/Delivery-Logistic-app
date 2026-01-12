import { Component, signal, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models/order.model';
import { HeroIconComponent } from '../../components/hero-icon/hero-icon';

@Component({
  selector: 'app-dashboard-view',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, DecimalPipe, HeroIconComponent],
  templateUrl: './dashboard-view.component.html',
  styleUrl: './dashboard-view.component.css'
})
export class DashboardViewComponent {
  private orderService = inject(OrderService);

  // Estado de tabs
  activeTab = signal<'all' | 'in-route' | 'pending' | 'delivered' | 'incidents'>('all');
  searchQuery = signal('');

  // Métricas del dashboard según la imagen
  totalShipments = signal(1240);
  totalShipmentsChange = signal({ value: 5, isPositive: true });
  
  deliveredSuccess = signal(85);
  deliveredSuccessChange = signal({ value: 2, isPositive: true });
  
  awaitingAssignment = signal(45);
  awaitingAssignmentAlert = signal(true);
  
  activeIncidents = signal(3);
  activeIncidentsChange = signal({ value: 10, isPositive: false });

  // Datos de envíos
  shipments = signal<any[]>([]);
  loading = signal(false);
  currentPage = signal(1);
  totalShipmentsCount = signal(128);

  constructor() {
    this.loadShipments();
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

  setActiveTab(tab: 'all' | 'in-route' | 'pending' | 'delivered' | 'incidents') {
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
}

