import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CompanyService } from '../../../services/company.service';
import { Company, CompanyCreate } from '../../../models/company.model';
import { HeroIconComponent } from '../../../components/hero-icon/hero-icon';

@Component({
  selector: 'app-company-list-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HeroIconComponent],
  templateUrl: './company-list-view.component.html',
  styleUrl: './company-list-view.component.css'
})
export class CompanyListViewComponent {
  private companyService = inject(CompanyService);
  private fb = inject(FormBuilder);
  
  companies = signal<Company[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  currentPage = signal(1);
  totalCount = signal(0);
  hasNext = signal(false);
  hasPrevious = signal(false);
  
  // Modal state
  showModal = signal(false);
  isEditMode = signal(false);
  editingCompanyId = signal<string | null>(null);
  formLoading = signal(false);
  formError = signal<string | null>(null);

  companyForm: FormGroup = this.fb.group({
    company_name: ['', [Validators.required, Validators.minLength(2)]],
    ruc: ['', [Validators.required, Validators.minLength(8)]],
    description: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  constructor() {
    this.loadCompanies();
  }

  loadCompanies() {
    this.loading.set(true);
    this.error.set(null);
    
    this.companyService.getAll().subscribe({
      next: (response) => {
        // Asegurar que siempre sea un array
        const companiesArray = Array.isArray(response?.result) ? response.result : [];
        this.companies.set(companiesArray);
        this.totalCount.set(response?.pagination?.count || 0);
        this.hasNext.set(response?.pagination?.next !== null);
        this.hasPrevious.set(response?.pagination?.previous !== null);
        this.currentPage.set(1);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar las empresas. Por favor, intente nuevamente.');
        this.companies.set([]); // Asegurar que siempre sea un array
        this.loading.set(false);
        console.error('Error loading companies:', err);
      }
    });
  }

  nextPage() {
    if (this.hasNext()) {
      // TODO: Implementar cuando el endpoint soporte paginación
      console.log('Paginación no implementada aún');
    }
  }

  previousPage() {
    if (this.hasPrevious()) {
      // TODO: Implementar cuando el endpoint soporte paginación
      console.log('Paginación no implementada aún');
    }
  }

  openNewCompanyModal() {
    this.isEditMode.set(false);
    this.editingCompanyId.set(null);
    this.companyForm.reset();
    this.companyForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.companyForm.get('password')?.updateValueAndValidity();
    this.formError.set(null);
    this.showModal.set(true);
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
    
    // En modo edición, el password es opcional
    this.companyForm.get('password')?.clearValidators();
    this.companyForm.get('password')?.updateValueAndValidity();
    
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
      console.error('Formulario no inicializado');
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
          next: () => {
            this.formLoading.set(false);
            this.closeModal();
            this.loadCompanies();
          },
          error: (err) => {
            this.formError.set('Error al actualizar la empresa.');
            this.formLoading.set(false);
            console.error('Error updating company:', err);
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
          next: () => {
            this.formLoading.set(false);
            this.closeModal();
            this.loadCompanies();
          },
          error: (err) => {
            this.formLoading.set(false);
            console.error('Error creating company:', err);
            
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

  deleteCompany(id: string) {
    if (confirm('¿Está seguro de que desea eliminar esta empresa?')) {
      this.companyService.delete(id).subscribe({
        next: () => {
          this.loadCompanies();
        },
        error: (err) => {
          this.error.set('Error al eliminar la empresa.');
          console.error('Error deleting company:', err);
        }
      });
    }
  }

  getFieldError(fieldName: string): string {
    const field = this.companyForm.get(fieldName);
    if (field?.hasError('required')) {
      return 'Este campo es requerido';
    }
    if (field?.hasError('email')) {
      return 'Email inválido';
    }
    if (field?.hasError('minlength')) {
      return `Mínimo ${field.errors!['minlength'].requiredLength} caracteres`;
    }
    return '';
  }

  Math = Math;
}
