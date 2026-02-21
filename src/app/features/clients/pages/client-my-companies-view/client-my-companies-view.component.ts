import { Component, HostListener, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { EmptyStateComponent } from '@app/shared/ui/empty-state/empty-state.component';
import { LoadingCardComponent } from '@app/shared/ui/loading-card/loading-card.component';
import { HeroIconComponent } from '@app/shared/ui/hero-icon/hero-icon';
import { ClientCompaniesFacade, ClientCompanyView } from '@app/features/clients/facades/client-companies.facade';

@Component({
  selector: 'app-client-my-companies-view',
  standalone: true,
  imports: [CommonModule, FormsModule, EmptyStateComponent, LoadingCardComponent, HeroIconComponent],
  templateUrl: './client-my-companies-view.component.html',
  styleUrl: './client-my-companies-view.component.css'
})
export class ClientMyCompaniesViewComponent implements OnInit {
  private clientCompaniesFacade = inject(ClientCompaniesFacade);
  private router = inject(Router);

  loading = signal(false);
  error = signal<string | null>(null);
  searchQuery = signal('');
  statusFilter = signal('');
  statusOpen = signal(false);
  companies = signal<ClientCompanyView[]>([]);
  pendingCompanies = signal<ClientCompanyView[]>([]);

  filteredCompanies = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const status = this.statusFilter();
    const base = status === 'pending' ? this.pendingCompanies() : this.companies();
    return base.filter(company => {
      const matchesQuery = !query
        || company.name.toLowerCase().includes(query)
        || company.companyId.toLowerCase().includes(query);
      const matchesStatus = !status || company.status === status;
      return matchesQuery && matchesStatus;
    });
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

  getStatusFilterLabel(): string {
    const status = this.statusFilter();
    if (!status) {
      return 'Todos';
    }
    return this.getStatusLabel(status as ClientCompanyView['status']);
  }

  toggleStatusMenu(): void {
    this.statusOpen.update(value => !value);
  }

  setStatusFilter(value: string): void {
    this.statusFilter.set(value);
    this.statusOpen.set(false);
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

  @HostListener('document:click')
  handleClick(): void {
    if (this.statusOpen()) {
      this.statusOpen.set(false);
    }
  }
}
