import { Component, HostListener, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { EmptyStateComponent } from '@app/shared/ui/empty-state/empty-state.component';
import { LoadingCardComponent } from '@app/shared/ui/loading-card/loading-card.component';
import { ProviderCompaniesFacade, ProviderCompanyView } from '@app/features/providers/facades/provider-companies.facade';

@Component({
  selector: 'app-provider-companies-view',
  standalone: true,
  imports: [CommonModule, FormsModule, EmptyStateComponent, LoadingCardComponent],
  templateUrl: './provider-companies-view.component.html',
  styleUrl: './provider-companies-view.component.css'
})
export class ProviderCompaniesViewComponent implements OnInit {
  private providerCompaniesFacade = inject(ProviderCompaniesFacade);

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
    this.providerCompaniesFacade.loadCompanies()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (companies) => {
          this.companies.set(companies);
        },
        error: () => {
          this.error.set('No se pudieron cargar las compañías.');
          this.companies.set([]);
        }
      });
  }

  @HostListener('document:click')
  handleClick(): void {
    if (this.statusOpen()) {
      this.statusOpen.set(false);
    }
  }
}
