import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard-view',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard-view.component.html',
  styleUrl: './dashboard-view.component.css'
})
export class DashboardViewComponent {
  // Métricas del dashboard
  ordersToday = signal(124);
  ordersTodayChange = signal({ value: 5, isPositive: true });
  
  inTransit = signal(45);
  inTransitChange = signal({ value: 12, isPositive: true });
  
  pending = signal(12);
  pendingChange = signal({ value: 2, isPositive: false });
  
  activeDrivers = signal({ current: 8, total: 10 });
  driversStatus = signal('Estable');

  // Datos del gráfico de estado de pedidos
  orderStatus = signal({
    total: 181,
    delivered: { percentage: 65, count: 118 },
    inRoute: { percentage: 20, count: 36 },
    delayed: { percentage: 15, count: 27 }
  });

  // Pedidos recientes (ejemplo)
  recentOrders = signal([
    {
      id: 'ORD-001',
      client: 'Alpakinos Sac',
      destination: 'Lima Centro',
      driver: 'Juan Pérez',
      status: 'En Ruta',
      statusClass: 'in-route'
    },
    {
      id: 'ORD-002',
      client: 'Tech Solutions',
      destination: 'San Isidro',
      driver: 'María García',
      status: 'Entregado',
      statusClass: 'delivered'
    },
    {
      id: 'ORD-003',
      client: 'Global Corp',
      destination: 'Miraflores',
      driver: 'Carlos López',
      status: 'Retrasado',
      statusClass: 'delayed'
    }
  ]);

  // Datos para el gráfico de volumen (últimos 7 días)
  deliveryVolume = signal([
    { day: 'Lun', value: 45 },
    { day: 'Mar', value: 52 },
    { day: 'Mié', value: 48 },
    { day: 'Hoy', value: 60, isToday: true },
    { day: 'Vie', value: 0 },
    { day: 'Sáb', value: 0 },
    { day: 'Dom', value: 0 }
  ]);

  getMaxValue(): number {
    return Math.max(...this.deliveryVolume().map(d => d.value), 60);
  }

  getBarHeight(value: number): number {
    const max = this.getMaxValue();
    return max > 0 ? (value / max) * 100 : 0;
  }
}

