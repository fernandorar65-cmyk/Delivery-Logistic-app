import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CompanyService } from '@app/features/companies/services/company.service';
import { Company, CompanyCreate } from '@app/features/companies/models/company.model';
import { CompaniesToolbarComponent } from './components/companies-toolbar/companies-toolbar.component';
import { CompaniesTableComponent } from './components/companies-table/companies-table.component';
import { PaginatorModule } from 'primeng/paginator';
import { ButtonModule } from 'primeng/button';
import { CompaniesFormModalComponent } from './components/companies-form-modal/companies-form-modal.component';
import { EmptyStateComponent } from '@app/shared/ui/empty-state/empty-state.component';
import { LoadingCardComponent } from '@app/shared/ui/loading-card/loading-card.component';
import { hasApiErrors } from '@app/shared/utils/api-response';
import { ConfirmModalComponent } from '@app/shared/ui/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-company-list-view',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CompaniesToolbarComponent,
    CompaniesTableComponent,
    PaginatorModule,
    ButtonModule,
    CompaniesFormModalComponent,
    EmptyStateComponent,
    LoadingCardComponent,
    ConfirmModalComponent
  ],
  templateUrl: './company-list-view.component.html',
  styleUrl: './company-list-view.component.css'
})
export class CompanyListViewComponent {
  private companyService = inject(CompanyService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  
  companies = signal<Company[]>([]);
  filteredCompanies = signal<Company[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  currentPage = signal(1);
  totalCount = signal(0);
  hasNext = signal(false);
  hasPrevious = signal(false);
  itemsPerPage = 10;
  /** Paginación PrimeNG */
  first = signal(0);
  rows = signal(10);
  
  // Search and filters
  searchQuery = signal('');
  activeFilters = signal<{type: string, value: string}[]>([]);
  selectedSector = signal<string>('all');
  selectedCity = signal<string>('all');
  selectedStatus = signal<string>('all');
  
  // Available options for filters
  sectors = signal<string[]>(['Manufactura', 'Salud', 'Tecnología', 'Retail', 'Servicios']);
  cities = signal<string[]>(['Bogotá D.C.', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena']);
  
  // Modal state
  showModal = signal(false);
  isEditMode = signal(false);
  deleteConfirmOpen = signal(false);
  deleteTargetId = signal<string | null>(null);
  deleteError = signal<string | null>(null);
  deleteLoading = signal(false);
  editingCompanyId = signal<string | null>(null);
  formLoading = signal(false);
  formError = signal<string | null>(null);

  companyForm: FormGroup = this.fb.group({
    company_name: ['', [Validators.required, Validators.minLength(2)]],
    ruc: ['', [Validators.required, Validators.minLength(8)]],
    description: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['']
  });

  constructor() {
    this.loadCompanies();
  }

  loadCompanies() {
    this.loading.set(true);
    this.error.set(null);
    
    this.companyService.getAll().subscribe({
      next: (response) => {
        if (hasApiErrors(response)) {
          this.error.set('Error al cargar las empresas. Por favor, intente nuevamente.');
          this.companies.set([]);
          this.filteredCompanies.set([]);
          this.loading.set(false);
          return;
        }
        // Asegurar que siempre sea un array
        const companiesArray = Array.isArray(response?.result) ? response.result : [];
        // Agregar datos mock para sector, ciudad, sedes y estado si no existen
        const companiesWithMockData = companiesArray.map(company => ({
          ...company,
          sector: company.sector || this.getRandomSector(),
          city: company.city || this.getRandomCity(),
          branches: company.branches || Math.floor(Math.random() * 50) + 1,
          status: company.status || (Math.random() > 0.2 ? 'active' : 'inactive')
        }));
        this.companies.set(companiesWithMockData);
        this.totalCount.set(response?.pagination?.count || companiesWithMockData.length);
        this.hasNext.set(response?.pagination?.next !== null);
        this.hasPrevious.set(response?.pagination?.previous !== null);
        this.currentPage.set(1);
        this.applyFilters();
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar las empresas. Por favor, intente nuevamente.');
        this.companies.set([]); // Asegurar que siempre sea un array
        this.filteredCompanies.set([]);
        this.loading.set(false);
      }
    });
  }

  getRandomSector(): string {
    const sectors = this.sectors();
    return sectors[Math.floor(Math.random() * sectors.length)];
  }

  getRandomCity(): string {
    const cities = this.cities();
    return cities[Math.floor(Math.random() * cities.length)];
  }

  applyFilters() {
    let filtered = [...this.companies()];
    
    // Aplicar búsqueda
    const search = this.searchQuery().toLowerCase().trim();
    if (search) {
      filtered = filtered.filter(company => 
        company.company_name.toLowerCase().includes(search) ||
        company.ruc.toLowerCase().includes(search)
      );
    }
    
    // Aplicar filtro de sector
    if (this.selectedSector() !== 'all') {
      filtered = filtered.filter(company => company.sector === this.selectedSector());
    }
    
    // Aplicar filtro de ciudad
    if (this.selectedCity() !== 'all') {
      filtered = filtered.filter(company => company.city === this.selectedCity());
    }
    
    // Aplicar filtro de estado
    if (this.selectedStatus() !== 'all') {
      filtered = filtered.filter(company => company.status === this.selectedStatus());
    }
    
    this.filteredCompanies.set(filtered);
    this.updateActiveFilters();
  }

  updateActiveFilters() {
    const filters: {type: string, value: string}[] = [];
    if (this.selectedStatus() === 'active') {
      filters.push({type: 'status', value: 'Activos'});
    }
    if (this.selectedSector() !== 'all') {
      filters.push({type: 'sector', value: this.selectedSector()});
    }
    if (this.selectedCity() !== 'all') {
      filters.push({type: 'city', value: this.selectedCity()});
    }
    this.activeFilters.set(filters);
  }

  removeFilter(type: string) {
    if (type === 'status') {
      this.selectedStatus.set('all');
    } else if (type === 'sector') {
      this.selectedSector.set('all');
    } else if (type === 'city') {
      this.selectedCity.set('all');
    }
    this.applyFilters();
  }

  clearAllFilters() {
    this.searchQuery.set('');
    this.selectedSector.set('all');
    this.selectedCity.set('all');
    this.selectedStatus.set('all');
    this.applyFilters();
  }

  onSearchChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
    this.applyFilters();
  }

  onSectorChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedSector.set(target.value);
    this.applyFilters();
  }

  onCityChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedCity.set(target.value);
    this.applyFilters();
  }

  getStatusClass(status?: string): string {
    return status === 'active' ? 'status-active' : 'status-inactive';
  }

  getStatusLabel(status?: string): string {
    return status === 'active' ? 'Activo' : 'Inactivo';
  }

  getSectorClass(sector?: string): string {
    const sectorMap: Record<string, string> = {
      'Manufactura': 'sector-manufactura',
      'Salud': 'sector-salud',
      'Tecnología': 'sector-tecnologia',
      'Retail': 'sector-retail',
      'Servicios': 'sector-servicios'
    };
    return sectorMap[sector || ''] || 'sector-default';
  }

  getCompanyInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  getCompanyColor(name: string): string {
    const colors = ['#4A90E2', '#50C878', '#FF6B6B', '#FFA500', '#9B59B6', '#1ABC9C', '#E74C3C'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  }

  get totalPages(): number {
    return Math.ceil(this.filteredCompanies().length / this.itemsPerPage);
  }

  get startItem(): number {
    return (this.currentPage() - 1) * this.itemsPerPage + 1;
  }

  get endItem(): number {
    return Math.min(this.currentPage() * this.itemsPerPage, this.filteredCompanies().length);
  }

  get paginatedCompanies(): Company[] {
    const start = this.first();
    const pageSize = this.rows();
    return this.filteredCompanies().slice(start, start + pageSize);
  }

  onPageChange(event: { first?: number; rows?: number }): void {
    this.first.set(event.first ?? 0);
    this.rows.set(event.rows ?? 10);
  }

  nextPage() {
    if (this.currentPage() < this.totalPages) {
      this.currentPage.set(this.currentPage() + 1);
    }
  }

  previousPage() {
    if (this.currentPage() > 1) {
      this.currentPage.set(this.currentPage() - 1);
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage.set(page);
    }
  }

  openNewCompanyModal() {
    this.isEditMode.set(false);
    this.editingCompanyId.set(null);
    this.companyForm.reset();
    this.formError.set(null);
    this.showModal.set(true);
  }

  goToUploadOrder(company: Company): void {
    const id = company?.id;
    if (id) {
      this.router.navigate(['/clients/shipments-upload'], { queryParams: { company_id: id } });
    }
  }

  openEditCompanyModal(company: Company) {
    this.isEditMode.set(true);
    this.editingCompanyId.set(company.id || null);
    this.formError.set(null);
    
    this.companyForm.patchValue({
      company_name: company.company_name || '',
      ruc: company.ruc || '',
      description: company.description || '',
      email: company.user_email || ''
    });
    
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.isEditMode.set(false);
    this.editingCompanyId.set(null);
    this.companyForm.reset();
    this.formError.set(null);
  }

  onSubmit(event?: Event) {
    // Prevenir el comportamiento por defecto del formulario
    if (event) {
      event.preventDefault();
    }

    // Prevenir submit si el formulario no existe o no es válido
    if (!this.companyForm) {
      this.formError.set('No se pudo inicializar el formulario.');
      return;
    }

    if (!this.companyForm.valid) {
      this.companyForm.markAllAsTouched();
      return;
    }

    this.formLoading.set(true);
    this.formError.set(null);

      const formValue = { ...this.companyForm.value };
      
      // Si estamos editando y no hay password, no lo enviamos
      if (this.isEditMode() && !formValue.password) {
        delete formValue.password;
      }

      if (this.isEditMode() && this.editingCompanyId()) {
        this.companyService.update(this.editingCompanyId()!, formValue).subscribe({
          next: (response) => {
            if (hasApiErrors(response)) {
              this.formError.set('Error al actualizar la empresa.');
              this.formLoading.set(false);
              return;
            }
            this.formLoading.set(false);
            this.closeModal();
            this.loadCompanies();
          },
          error: (err) => {
            this.formError.set('Error al actualizar la empresa.');
            this.formLoading.set(false);
          }
        });
      } else {
        const companyPayload: CompanyCreate = {
          company_name: formValue.company_name,
          ruc: formValue.ruc,
          description: formValue.description || '',
          email: formValue.email,
          password: formValue.password
        };

        this.companyService.create(companyPayload).subscribe({
          next: (response) => {
            if (hasApiErrors(response)) {
              this.formError.set('Error al crear la empresa. Por favor, intenta nuevamente.');
              this.formLoading.set(false);
              return;
            }
            this.formLoading.set(false);
            this.closeModal();
            this.loadCompanies();
          },
          error: (err) => {
            this.formLoading.set(false);
            
            if (err.status === 400) {
              this.formError.set('Datos inválidos. Por favor, verifica todos los campos.');
            } else if (err.status === 401) {
              this.formError.set('No autorizado. Por favor, inicia sesión nuevamente.');
            } else if (err.status === 409) {
              this.formError.set('El email o RUC ya está registrado.');
            } else if (err.status === 0) {
              this.formError.set('Error de conexión. Por favor, verifica tu conexión a internet.');
            } else {
              this.formError.set('Error al crear la empresa. Por favor, intenta nuevamente.');
            }
          }
        });
      }
  }

  openDeleteConfirm(id: string) {
    this.deleteTargetId.set(id);
    this.deleteError.set(null);
    this.deleteConfirmOpen.set(true);
  }

  closeDeleteConfirm() {
    this.deleteConfirmOpen.set(false);
    this.deleteTargetId.set(null);
    this.deleteError.set(null);
  }

  confirmDeleteCompany() {
    const id = this.deleteTargetId();
    if (!id) return;
    this.deleteLoading.set(true);
    this.deleteError.set(null);
    this.companyService.delete(id).subscribe({
      next: () => {
        this.deleteLoading.set(false);
        this.closeDeleteConfirm();
        this.loadCompanies();
      },
      error: () => {
        this.deleteLoading.set(false);
        this.deleteError.set('Error al eliminar la empresa.');
      }
    });
  }

  getPageNumbers(): (number | string)[] {
    const total = this.totalPages;
    const current = this.currentPage();
    const pages: (number | string)[] = [];
    
    if (total <= 7) {
      // Si hay 7 o menos páginas, mostrar todas
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      // Lógica para mostrar páginas con ellipsis
      if (current <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(total);
      } else if (current >= total - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = total - 3; i <= total; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = current - 1; i <= current + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(total);
      }
    }
    
    return pages;
  }

  isPageNumber(page: number | string): page is number {
    return typeof page === 'number';
  }

  goToPageFromTemplate(page: number | string) {
    if (this.isPageNumber(page)) {
      this.goToPage(page);
    }
  }

  Math = Math;
}






