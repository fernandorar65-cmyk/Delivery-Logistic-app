import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { EmptyStateComponent } from '@app/shared/ui/empty-state/empty-state.component';
import { LoadingCardComponent } from '@app/shared/ui/loading-card/loading-card.component';
import { ClientService } from '@app/features/clients/services/client.service';
import { ClientCompany } from '@app/features/clients/models/client-company.model';

type ClientCompanyView = {
  id: string;
  name: string;
  companyId: string;
  status: 'active' | 'pending' | 'inactive';
  since: string;
  industry: string;
};

@Component({
  selector: 'app-client-my-companies-view',
  standalone: true,
  imports: [CommonModule, FormsModule, EmptyStateComponent, LoadingCardComponent],
  templateUrl: './client-my-companies-view.component.html',
  styleUrl: './client-my-companies-view.component.css'
})
export class ClientMyCompaniesViewComponent implements OnInit {
  private clientService = inject(ClientService);

  loading = signal(false);
  error = signal<string | null>(null);
  searchQuery = signal('');
  statusFilter = signal('');
  companies = signal<ClientCompanyView[]>([]);

  filteredCompanies = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const status = this.statusFilter();
    return this.companies().filter(company => {
      const matchesQuery = !query
        || company.name.toLowerCase().includes(query)
        || company.companyId.toLowerCase().includes(query);
      const matchesStatus = !status || company.status === status;
      return matchesQuery && matchesStatus;
    });
  });

  ngOnInit(): void {
    this.loadCompanies();
  }

  getStatusLabel(status: ClientCompanyView['status']) {
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

  getStatusFilterLabel(): string {
    const status = this.statusFilter();
    if (!status) {
      return 'Todos';
    }
    return this.getStatusLabel(status as ClientCompanyView['status']);
  }

  private loadCompanies(): void {
    this.loading.set(true);
    this.error.set(null);
    this.clientService.getMyCompanies()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          if (response?.errors?.length) {
            this.error.set('No se pudieron cargar las compañías.');
            this.companies.set([]);
            return;
          }
          const items = Array.isArray(response?.result) ? response.result : [];
          this.companies.set(items.map(item => this.mapToView(item)));
        },
        error: () => {
          this.error.set('No se pudieron cargar las compañías.');
          this.companies.set([]);
        }
      });
  }

  private mapToView(item: ClientCompany): ClientCompanyView {
    const status = this.mapStatus(item.status);
    return {
      id: item.id,
      name: item.company_name ?? 'Compañía sin nombre',
      companyId: item.company_id ?? item.id,
      status,
      since: this.formatDate(item.created_at),
      industry: 'Sin rubro'
    };
  }

  private mapStatus(status?: string): ClientCompanyView['status'] {
    const normalized = (status ?? '').toLowerCase();
    if (normalized === 'pending') return 'pending';
    if (normalized === 'accepted' || normalized === 'active') return 'active';
    if (normalized === 'rejected' || normalized === 'inactive') return 'inactive';
    return 'active';
  }

  private formatDate(value?: string): string {
    if (!value) return 'Sin fecha';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Sin fecha';
    return date.toLocaleDateString('es-PE', { year: 'numeric', month: 'short', day: '2-digit' });
  }
}
