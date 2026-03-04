import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmptyStateComponent } from '@app/shared/ui/empty-state/empty-state.component';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { SelectModule } from 'primeng/select';

export interface ProviderOrder {
  id: string;
  client: string;
  route: string;
  status: 'pending' | 'in_progress' | 'completed';
  time: string;
}

@Component({
  selector: 'app-provider-orders-view',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    EmptyStateComponent,
    TableModule,
    TagModule,
    ButtonModule,
    TooltipModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    PaginatorModule,
    SelectModule
  ],
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

  keywordSearch = signal('');
  filterId = signal('');
  filterClient = signal('');
  filterStatus = signal<string>('');
  first = signal(0);
  rows = signal(10);

  statusFilterOptions = [
    { label: 'Todos', value: '' },
    { label: 'Pendiente', value: 'pending' },
    { label: 'En ruta', value: 'in_progress' },
    { label: 'Completado', value: 'completed' }
  ];

  filteredOrders = computed(() => {
    const list = this.orders();
    const keyword = (this.keywordSearch() || '').trim().toLowerCase();
    const id = (this.filterId() || '').trim().toLowerCase();
    const client = (this.filterClient() || '').trim().toLowerCase();
    const status = this.filterStatus();
    return list.filter(order => {
      if (keyword) {
        const match =
          order.id.toLowerCase().includes(keyword) ||
          order.client.toLowerCase().includes(keyword) ||
          order.route.toLowerCase().includes(keyword);
        if (!match) return false;
      }
      if (id && !order.id.toLowerCase().includes(id)) return false;
      if (client && !order.client.toLowerCase().includes(client)) return false;
      if (status && order.status !== status) return false;
      return true;
    });
  });

  paginatedOrders = computed(() => {
    const list = this.filteredOrders();
    const start = this.first();
    const pageSize = this.rows();
    return list.slice(start, start + pageSize);
  });

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

  getStatusSeverity(status: ProviderOrder['status']): 'success' | 'warn' | 'info' | 'secondary' {
    switch (status) {
      case 'pending':
        return 'warn';
      case 'in_progress':
        return 'info';
      case 'completed':
        return 'success';
      default:
        return 'secondary';
    }
  }

  onPageChange(event: { first?: number; rows?: number }) {
    this.first.set(event.first ?? 0);
    this.rows.set(event.rows ?? 10);
  }

  onKeywordSearch(event: Event) {
    this.keywordSearch.set((event.target as HTMLInputElement).value);
  }

  onFilterId(event: Event) {
    this.filterId.set((event.target as HTMLInputElement).value);
  }

  onFilterClient(event: Event) {
    this.filterClient.set((event.target as HTMLInputElement).value);
  }
}
