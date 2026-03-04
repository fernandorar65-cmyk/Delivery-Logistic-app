import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { EmptyStateComponent } from '@app/shared/ui/empty-state/empty-state.component';
import { LoadingCardComponent } from '@app/shared/ui/loading-card/loading-card.component';
import { ClientCompaniesFacade, ClientCompanyView } from '@app/features/clients/facades/client-companies.facade';
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
  selector: 'app-client-my-companies-view',
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
  templateUrl: './client-my-companies-view.component.html',
  styleUrl: './client-my-companies-view.component.css'
})
export class ClientMyCompaniesViewComponent implements OnInit {
  private clientCompaniesFacade = inject(ClientCompaniesFacade);
  private router = inject(Router);

  loading = signal(false);
  error = signal<string | null>(null);
  companies = signal<ClientCompanyView[]>([]);
  pendingCompanies = signal<ClientCompanyView[]>([]);

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
    const status = this.filterStatus();
    const base = status === 'pending' ? this.pendingCompanies() : this.companies();
    const keyword = (this.keywordSearch() || '').trim().toLowerCase();
    const name = (this.filterName() || '').trim().toLowerCase();
    const id = (this.filterId() || '').trim().toLowerCase();
    return base.filter(company => {
      if (keyword) {
        const match = company.name.toLowerCase().includes(keyword) || company.companyId.toLowerCase().includes(keyword);
        if (!match) return false;
      }
      if (name && !company.name.toLowerCase().includes(name)) return false;
      if (id && !company.companyId.toLowerCase().includes(id)) return false;
      if (status && status !== 'pending' && company.status !== status) return false;
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
    this.loadPendingCompanies();
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

  getStatusSeverity(status: ClientCompanyView['status']): 'success' | 'warn' | 'danger' | 'secondary' {
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

  goToUploadOrder(company: ClientCompanyView): void {
    const companyId = company?.companyId;
    if (companyId) {
      this.router.navigate(['/clients/shipments-upload'], { queryParams: { company_id: companyId } });
    }
  }

  goToSingleOrder(company: ClientCompanyView): void {
    const companyId = company?.companyId;
    if (companyId) {
      this.router.navigate(['/clients/single-order'], { queryParams: { company_id: companyId } });
    }
  }

  onViewDetails(company: ClientCompanyView): void {
    // TODO: navegar a detalle o abrir modal
  }

  onFinalize(company: ClientCompanyView): void {
    // TODO: confirmar y finalizar relación
  }

  private loadCompanies(): void {
    this.loading.set(true);
    this.error.set(null);
    this.clientCompaniesFacade.loadCompanies()
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

  private loadPendingCompanies(): void {
    this.clientCompaniesFacade.loadPendingCompanies()
      .subscribe({
        next: (companies) => {
          this.pendingCompanies.set(companies);
        },
        error: () => {
          this.pendingCompanies.set([]);
        }
      });
  }
}
