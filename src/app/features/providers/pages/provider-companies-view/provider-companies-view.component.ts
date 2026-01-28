import { Component, ElementRef, HostListener, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { EmptyStateComponent } from '@app/shared/ui/empty-state/empty-state.component';
import { LoadingCardComponent } from '@app/shared/ui/loading-card/loading-card.component';
import { ProviderService } from '@app/features/providers/services/provider.service';
import { ProviderCompany } from '@app/features/providers/models/provider-company.model';

interface ProviderCompanyView {
  id: string;
  name: string;
  industry: string;
  status: 'active' | 'pending' | 'inactive';
  since: string;
  companyId: string;
}

@Component({
  selector: 'app-provider-companies-view',
  standalone: true,
  imports: [CommonModule, FormsModule, EmptyStateComponent, LoadingCardComponent],
  templateUrl: './provider-companies-view.component.html',
  styleUrl: './provider-companies-view.component.css'
})
export class ProviderCompaniesViewComponent implements OnInit {
  private providerService = inject(ProviderService);
  private elementRef = inject(ElementRef);

  loading = signal(false);
  error = signal<string | null>(null);
  searchQuery = signal('');
  statusFilter = signal('');
  statusOpen = signal(false);

  companies = signal<ProviderCompanyView[]>([]);

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

  getStatusLabel(status: ProviderCompanyView['status']) {
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
    return this.getStatusLabel(status as ProviderCompanyView['status']);
  }

  toggleStatusMenu(): void {
    this.statusOpen.update(value => !value);
  }

  setStatusFilter(value: string): void {
    this.statusFilter.set(value);
    this.statusOpen.set(false);
  }

  private loadCompanies(): void {
    this.loading.set(true);
    this.error.set(null);
    this.providerService.getMyCompanies()
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

  private mapToView(item: ProviderCompany): ProviderCompanyView {
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

  private mapStatus(status?: string): ProviderCompanyView['status'] {
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

  @HostListener('document:click')
  handleClick(): void {
    if (this.statusOpen()) {
      this.statusOpen.set(false);
    }
  }
}
