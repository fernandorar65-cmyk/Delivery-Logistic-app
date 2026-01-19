import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmptyStateComponent } from '@app/shared/ui/empty-state/empty-state.component';
import { LoadingCardComponent } from '@app/shared/ui/loading-card/loading-card.component';

interface ProviderCompany {
  id: string;
  name: string;
  industry: string;
  status: 'active' | 'pending' | 'inactive';
  since: string;
}

@Component({
  selector: 'app-provider-companies-view',
  standalone: true,
  imports: [CommonModule, FormsModule, EmptyStateComponent, LoadingCardComponent],
  templateUrl: './provider-companies-view.component.html',
  styleUrl: './provider-companies-view.component.css'
})
export class ProviderCompaniesViewComponent {
  loading = signal(false);
  error = signal<string | null>(null);
  searchQuery = signal('');
  statusFilter = signal('');

  companies = signal<ProviderCompany[]>([
    {
      id: 'C-1201',
      name: 'Global Logistics S.A.',
      industry: 'Logística · Internacional',
      status: 'active',
      since: 'Desde Ene 2025'
    },
    {
      id: 'C-1189',
      name: 'EcoFreight Solutions',
      industry: 'Carga Terrestre',
      status: 'pending',
      since: 'Solicitud reciente'
    },
    {
      id: 'C-1165',
      name: 'Skyline Air Cargo',
      industry: 'Logística Aérea',
      status: 'inactive',
      since: 'Inactivo'
    }
  ]);

  filteredCompanies = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const status = this.statusFilter();
    return this.companies().filter(company => {
      const matchesQuery = !query
        || company.name.toLowerCase().includes(query)
        || company.id.toLowerCase().includes(query);
      const matchesStatus = !status || company.status === status;
      return matchesQuery && matchesStatus;
    });
  });

  getStatusLabel(status: ProviderCompany['status']) {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'pending':
        return 'Pendiente';
      case 'inactive':
        return 'Inactivo';
      default:
        return status;
    }
  }
}
