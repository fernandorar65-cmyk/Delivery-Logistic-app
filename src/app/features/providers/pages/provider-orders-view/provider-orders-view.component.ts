import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmptyStateComponent } from '@app/shared/ui/empty-state/empty-state.component';
import { HeroIconComponent } from '@app/shared/ui/hero-icon/hero-icon';

interface ProviderOrder {
  id: string;
  client: string;
  route: string;
  status: 'pending' | 'in_progress' | 'completed';
  time: string;
}

@Component({
  selector: 'app-provider-orders-view',
  standalone: true,
  imports: [CommonModule, EmptyStateComponent, HeroIconComponent],
  templateUrl: './provider-orders-view.component.html',
  styleUrl: './provider-orders-view.component.css'
})
export class ProviderOrdersViewComponent {
  orders = signal<ProviderOrder[]>([
    {
      id: '#OP-1204',
      client: 'Global Logistics S.A.',
      route: 'Bogotá → Medellín',
      status: 'pending',
      time: 'Hace 20 min'
    },
    {
      id: '#OP-1203',
      client: 'EcoFreight Solutions',
      route: 'Cali → Pereira',
      status: 'in_progress',
      time: 'Hace 2 horas'
    },
    {
      id: '#OP-1201',
      client: 'Skyline Air Cargo',
      route: 'Barranquilla → Cartagena',
      status: 'completed',
      time: 'Ayer'
    }
  ]);

  getStatusLabel(status: ProviderOrder['status']) {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'in_progress':
        return 'En ruta';
      case 'completed':
        return 'Completado';
      default:
        return status;
    }
  }
}
