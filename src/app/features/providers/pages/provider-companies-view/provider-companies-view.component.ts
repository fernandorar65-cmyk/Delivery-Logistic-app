import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { EmptyStateComponent } from '@app/shared/ui/empty-state/empty-state.component';
import { LoadingCardComponent } from '@app/shared/ui/loading-card/loading-card.component';
import { ProviderCompaniesFacade, ProviderCompanyView } from '@app/features/providers/facades/provider-companies.facade';
import { TableModule } from 'primeng/table';
import { AvatarModule } from 'primeng/avatar';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { PaginatorModule } from 'primeng/paginator';

@Component({
  selector: 'app-provider-companies-view',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    EmptyStateComponent,
    LoadingCardComponent,
    TableModule,
    AvatarModule,
    TagModule,
    ButtonModule,
    TooltipModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    SelectModule,
    PaginatorModule
  ],
  templateUrl: './provider-companies-view.component.html',
  styleUrl: './provider-companies-view.component.css'
})
export class ProviderCompaniesViewComponent implements OnInit {
  private providerCompaniesFacade = inject(ProviderCompaniesFacade);

  loading = signal(false);
  error = signal<string | null>(null);
  companies = signal<ProviderCompanyView[]>([]);

  keywordSearch = signal('');
  filterName = signal('');
  filterId = signal('');
  filterStatus = signal<string>('');
  first = signal(0);
  rows = signal(10);

  statusFilterOptions = [
    { label: 'Todos', value: '' },
    { label: 'Activo', value: 'active' },
    { label: 'Pendiente', value: 'pending' },
    { label: 'Inactivo', value: 'inactive' }
  ];

  filteredCompanies = computed(() => {
    const list = this.companies();
    const keyword = (this.keywordSearch() || '').trim().toLowerCase();
    const name = (this.filterName() || '').trim().toLowerCase();
    const id = (this.filterId() || '').trim().toLowerCase();
    const status = this.filterStatus();
    return list.filter(company => {
      if (keyword) {
        const matchKeyword =
          company.name.toLowerCase().includes(keyword) ||
          company.companyId.toLowerCase().includes(keyword);
        if (!matchKeyword) return false;
      }
      if (name && !company.name.toLowerCase().includes(name)) return false;
      if (id && !company.companyId.toLowerCase().includes(id)) return false;
      if (status && company.status !== status) return false;
      return true;
    });
  });

  paginatedCompanies = computed(() => {
    const list = this.filteredCompanies();
    const start = this.first();
    const pageSize = this.rows();
    return list.slice(start, start + pageSize);
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

  getStatusSeverity(status: ProviderCompanyView['status']): 'success' | 'warn' | 'danger' | 'secondary' {
    switch (status) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warn';
      case 'inactive':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  getCompanyInitials(name: string): string {
    if (!name?.trim()) return '--';
    return name.slice(0, 2).toUpperCase();
  }

  onPageChange(event: { first?: number; rows?: number }) {
    this.first.set(event.first ?? 0);
    this.rows.set(event.rows ?? 10);
  }

  onKeywordSearch(event: Event) {
    this.keywordSearch.set((event.target as HTMLInputElement).value);
  }

  onFilterName(event: Event) {
    this.filterName.set((event.target as HTMLInputElement).value);
  }

  onFilterId(event: Event) {
    this.filterId.set((event.target as HTMLInputElement).value);
  }

  loadCompanies(): void {
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
}
