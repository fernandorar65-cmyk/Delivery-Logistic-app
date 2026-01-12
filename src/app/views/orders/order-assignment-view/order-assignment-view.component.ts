import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeroIconComponent } from '../../../components/hero-icon/hero-icon';

// Interfaces para los datos mock
interface PendingOrder {
  id: string;
  orderNumber: string;
  clientName: string;
  priority: 'urgent' | 'normal' | 'low';
  tags: string[];
  timeAgo: string;
  weight: number;
  volume: number;
  zone: string;
  selected: boolean;
}

interface Vehicle {
  id: string;
  name: string;
  plate: string;
  driver: string;
  currentLoad: number;
  maxCapacity: number;
  zone: string[];
  status: 'available' | 'maintenance' | 'busy';
  recommended?: boolean;
}

interface AssignmentStats {
  pending: number;
  vehicles: number;
  totalCapacity: number;
}

@Component({
  selector: 'app-order-assignment-view',
  standalone: true,
  imports: [CommonModule, FormsModule, HeroIconComponent],
  templateUrl: './order-assignment-view.component.html',
  styleUrl: './order-assignment-view.component.css'
})
export class OrderAssignmentViewComponent {
  // Estadísticas
  stats = signal<AssignmentStats>({
    pending: 142,
    vehicles: 28,
    totalCapacity: 15.4
  });

  // Pedidos pendientes
  pendingOrders = signal<PendingOrder[]>([
    {
      id: '1',
      orderNumber: 'ORD-8392',
      clientName: 'Supermercados El Rey S.A.',
      priority: 'urgent',
      tags: ['Urgente'],
      timeAgo: 'Hace 2 horas',
      weight: 450,
      volume: 2.5,
      zone: 'Zona Norte',
      selected: true
    },
    {
      id: '2',
      orderNumber: 'ORD-8393',
      clientName: 'Distribuidora Central',
      priority: 'normal',
      tags: ['Refrigerado'],
      timeAgo: 'Hace 45 min',
      weight: 1200,
      volume: 5.0,
      zone: 'Zona Sur',
      selected: false
    },
    {
      id: '3',
      orderNumber: 'ORD-8395',
      clientName: 'Tiendas Metro',
      priority: 'normal',
      tags: [],
      timeAgo: 'Hace 3 horas',
      weight: 320,
      volume: 1.8,
      zone: 'Zona Norte',
      selected: true
    },
    {
      id: '4',
      orderNumber: 'ORD-8401',
      clientName: 'Farmacias Unidas',
      priority: 'normal',
      tags: [],
      timeAgo: 'Reciente',
      weight: 150,
      volume: 0.5,
      zone: 'Centro',
      selected: false
    },
    {
      id: '5',
      orderNumber: 'ORD-8410',
      clientName: 'Electrónica Global',
      priority: 'normal',
      tags: ['Frágil'],
      timeAgo: 'Hace 5 horas',
      weight: 85,
      volume: 0.9,
      zone: 'Zona Norte',
      selected: true
    }
  ]);

  // Vehículos disponibles
  vehicles = signal<Vehicle[]>([
    {
      id: '1',
      name: 'Hino 300',
      plate: 'ABC-123',
      driver: 'Juan Pérez',
      currentLoad: 855,
      maxCapacity: 3500,
      zone: ['Zona Norte', 'Centro'],
      status: 'available',
      recommended: true
    },
    {
      id: '2',
      name: 'Ford Transit',
      plate: 'XYZ-987',
      driver: 'Maria G.',
      currentLoad: 1200,
      maxCapacity: 1800,
      zone: ['Zona Sur'],
      status: 'available'
    },
    {
      id: '3',
      name: 'Isuzu NPR',
      plate: 'LMN-456',
      driver: 'Carlos R.',
      currentLoad: 0,
      maxCapacity: 2500,
      zone: ['Zona Norte'],
      status: 'maintenance'
    }
  ]);

  // Estado de selección
  selectAll = signal(false);
  searchQuery = signal<string>('');
  activeFilters = signal<string[]>(['Zona Norte', 'Alta Prioridad']);

  // Resumen de selección
  get selectedOrders() {
    return this.pendingOrders().filter(order => order.selected);
  }

  get totalSelectedWeight() {
    return this.selectedOrders.reduce((sum, order) => sum + order.weight, 0);
  }

  get totalSelectedVolume() {
    return this.selectedOrders.reduce((sum, order) => sum + order.volume, 0);
  }

  // Métodos
  toggleSelectAll() {
    const newValue = !this.selectAll();
    this.selectAll.set(newValue);
    this.pendingOrders.update(orders => 
      orders.map(order => ({ ...order, selected: newValue }))
    );
  }

  toggleOrderSelection(orderId: string) {
    this.pendingOrders.update(orders =>
      orders.map(order =>
        order.id === orderId ? { ...order, selected: !order.selected } : order
      )
    );
    // Actualizar selectAll basado en si todos están seleccionados
    const allSelected = this.pendingOrders().every(order => order.selected);
    this.selectAll.set(allSelected);
  }

  removeFilter(filter: string) {
    this.activeFilters.update(filters => filters.filter(f => f !== filter));
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'urgent':
        return 'priority-urgent';
      case 'low':
        return 'priority-low';
      default:
        return 'priority-normal';
    }
  }

  getTagClass(tag: string): string {
    const tagLower = tag.toLowerCase();
    if (tagLower.includes('urgente')) return 'tag-urgent';
    if (tagLower.includes('refrigerado')) return 'tag-refrigerated';
    if (tagLower.includes('frágil') || tagLower.includes('fragil')) return 'tag-fragile';
    return 'tag-default';
  }

  getVehicleCapacityPercent(vehicle: Vehicle): number {
    return (vehicle.currentLoad / vehicle.maxCapacity) * 100;
  }

  getPotentialLoadPercent(vehicle: Vehicle): number {
    const potentialLoad = this.totalSelectedWeight;
    return (potentialLoad / vehicle.maxCapacity) * 100;
  }

  assignOrdersToVehicle(vehicleId: string) {
    const vehicle = this.vehicles().find(v => v.id === vehicleId);
    if (vehicle && this.selectedOrders.length > 0) {
      console.log(`Asignando ${this.selectedOrders.length} pedidos a ${vehicle.name}`);
      // Aquí iría la lógica de asignación real
    }
  }

  autoMatch() {
    console.log('Auto-match iniciado');
    // Aquí iría la lógica de auto-match
  }
}
