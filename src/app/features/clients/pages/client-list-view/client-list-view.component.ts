import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClientService } from '@app/features/clients/services/client.service';
import { Client, ClientCreate } from '@app/features/clients/models/client.model';
import { HeroIconComponent } from '@app/shared/ui/hero-icon/hero-icon';
import { ClientsToolbarComponent } from './components/clients-toolbar/clients-toolbar.component';
import { ClientsTableComponent } from './components/clients-table/clients-table.component';
import { PaginationComponent } from '@app/shared/ui/pagination/pagination.component';
import { ClientsStatsComponent } from './components/clients-stats/clients-stats.component';
import { ClientsFormModalComponent } from './components/clients-form-modal/clients-form-modal.component';
import { ClientsSuccessModalComponent } from './components/clients-success-modal/clients-success-modal.component';
import { StorageService } from '@app/core/storage/storage.service';
import { LocalStorageEnums } from '@app/shared/models/local.storage.enums';
import { CompanyRequestPending } from '@app/features/clients/models/company-request-pending.model';
import { hasApiErrors } from '@app/shared/utils/api-response';

@Component({
  selector: 'app-client-list-view',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HeroIconComponent,
    ClientsToolbarComponent,
    ClientsTableComponent,
    PaginationComponent,
    ClientsStatsComponent,
    ClientsFormModalComponent,
    ClientsSuccessModalComponent
  ],
  templateUrl: './client-list-view.component.html',
  styleUrl: './client-list-view.component.css'
})
export class ClientListViewComponent implements OnInit {
  private clientService = inject(ClientService);
  private fb = inject(FormBuilder);
  private storageService = inject(StorageService);
  
  clients = signal<Client[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  currentPage = signal(1);
  totalCount = signal(0);
  hasNext = signal(false);
  hasPrevious = signal(false);
  pageSize = signal(10);
  isCompanyUser = signal(false);
  showPending = signal(false);
  pendingCount = signal(0);
  
  // Modal state
  showModal = signal(false);
  isEditMode = signal(false);
  editingClientId = signal<string | null>(null);
  formLoading = signal(false);
  formError = signal<string | null>(null);
  showSuccessModal = signal(false);

  clientForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    client_name: ['', [Validators.required, Validators.minLength(2)]],
    ruc: ['', [Validators.required, Validators.minLength(8)]],
    description: ['']
  });

  ngOnInit(): void {
    const userType = this.storageService.getItem(LocalStorageEnums.USER_TYPE);
    this.isCompanyUser.set((userType ?? '').toLowerCase() === 'company');
    this.loadClients(1);
  }

  loadClients(page: number = 1) {
    this.loading.set(true);
    this.error.set(null);
    this.showPending.set(false);
    
    this.clientService.getAll(page).subscribe({
      next: (response) => {
        if (hasApiErrors(response)) {
          this.error.set('Error al cargar los clientes. Por favor, intente nuevamente.');
          this.loading.set(false);
          return;
        }
        const results = response.result;
        this.clients.set(results);
        this.totalCount.set(response.pagination?.count ?? results.length);
        const hasNext = !!response.pagination?.next;
        this.hasNext.set(hasNext);
        this.hasPrevious.set(!!response.pagination?.previous);
        if ((hasNext || page === 1) && results.length > 0) {
          this.pageSize.set(results.length);
        }
        this.currentPage.set(page);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar los clientes. Por favor, intente nuevamente.');
        this.loading.set(false);
      }
    });
  }

  loadPendingClients() {
    this.loading.set(true);
    this.error.set(null);

    this.clientService.getPendingCompanyClients().subscribe({
      next: (response) => {
        if (hasApiErrors(response)) {
          this.error.set('Error al cargar los clientes pendientes.');
          this.loading.set(false);
          return;
        }
        const results = response.result || [];
        const mapped = results.map((match) => this.mapPendingToClient(match));
        this.clients.set(mapped);
        this.pendingCount.set(response.pagination?.count ?? mapped.length);
        this.totalCount.set(response.pagination?.count ?? mapped.length);
        const hasNext = !!response.pagination?.next;
        this.hasNext.set(hasNext);
        this.hasPrevious.set(!!response.pagination?.previous);
        if ((hasNext || this.currentPage() === 1) && mapped.length > 0) {
          this.pageSize.set(mapped.length);
        }
        this.currentPage.set(1);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar los clientes pendientes.');
        this.loading.set(false);
      }
    });
  }

  togglePending() {
    if (!this.isCompanyUser()) {
      return;
    }
    const next = !this.showPending();
    this.showPending.set(next);
    if (next) {
      this.loadPendingClients();
    } else {
      this.loadClients(1);
    }
  }

  nextPage() {
    if (this.showPending()) {
      return;
    }
    if (this.hasNext()) {
      this.loadClients(this.currentPage() + 1);
    }
  }

  previousPage() {
    if (this.showPending()) {
      return;
    }
    if (this.hasPrevious()) {
      this.loadClients(this.currentPage() - 1);
    }
  }

  get startItem(): number {
    const count = this.clients().length;
    if (this.totalCount() === 0 || count === 0) {
      return 0;
    }
    return (this.currentPage() - 1) * this.pageSize() + 1;
  }

  get endItem(): number {
    const count = this.clients().length;
    if (this.totalCount() === 0 || count === 0) {
      return 0;
    }
    return Math.min(this.startItem + count - 1, this.totalCount());
  }

  get totalPages(): number {
    if (this.pageSize() <= 0) {
      return 1;
    }
    return Math.max(1, Math.ceil(this.totalCount() / this.pageSize()));
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goToPage(page: number) {
    if (this.showPending()) {
      return;
    }
    if (page === this.currentPage()) {
      return;
    }
    if (page >= 1 && page <= this.totalPages) {
      this.loadClients(page);
    }
  }

  openNewClientModal() {
    this.isEditMode.set(false);
    this.editingClientId.set(null);
    this.clientForm.reset();
    this.clientForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.clientForm.get('password')?.updateValueAndValidity();
    this.formError.set(null);
    this.showModal.set(true);
  }

  openEditClientModal(client: Client) {
    this.isEditMode.set(true);
    this.editingClientId.set(client.id || null);
    this.formError.set(null);
    
    this.clientForm.patchValue({
      email: client.email || '',
      client_name: client.client_name || '',
      ruc: client.ruc || '',
      description: client.description || ''
    });
    
    // En modo edición, el password es opcional
    this.clientForm.get('password')?.clearValidators();
    this.clientForm.get('password')?.updateValueAndValidity();
    
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.isEditMode.set(false);
    this.editingClientId.set(null);
    this.clientForm.reset();
    this.formError.set(null);
    this.formLoading.set(false);
  }

  closeSuccessModal() {
    this.showSuccessModal.set(false);
  }

  onSubmit(event?: Event) {
    event?.preventDefault();
    event?.stopPropagation();

    if (this.clientForm.valid) {
      this.formLoading.set(true);
      this.formError.set(null);

      const formValue = { ...this.clientForm.value };
      
      // Si estamos editando y no hay password, no lo enviamos
      if (this.isEditMode() && !formValue.password) {
        delete formValue.password;
      }

      if (this.isEditMode() && this.editingClientId()) {
        this.clientService.update(this.editingClientId()!, formValue).subscribe({
          next: (response) => {
            if (hasApiErrors(response)) {
              this.formError.set('Error al actualizar el cliente.');
              this.formLoading.set(false);
              return;
            }
            this.formLoading.set(false);
            this.closeModal();
            this.loadClients(this.currentPage());
          },
          error: (err) => {
            this.formError.set('Error al actualizar el cliente.');
            this.formLoading.set(false);
          }
        });
      } else {
        const clientPayload: ClientCreate = {
          email: formValue.email,
          password: formValue.password,
          client_name: formValue.client_name,
          ruc: formValue.ruc,
          description: formValue.description || undefined
        };

        this.clientService.create(clientPayload).subscribe({
          next: (response) => {
            if (hasApiErrors(response)) {
              this.formError.set('Error al crear el cliente. Por favor, intenta nuevamente.');
              this.formLoading.set(false);
              return;
            }
            this.formLoading.set(false);
            this.closeModal();
            this.loadClients(this.currentPage());
            this.showSuccessModal.set(true);
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
              this.formError.set('Error al crear el cliente. Por favor, intenta nuevamente.');
            }
          }
        });
      }
    } else {
      this.clientForm.markAllAsTouched();
    }
  }

  // Helpers movidos al componente de tabla.

  deleteClient(id?: string) {
    if (!id) return;
    if (confirm('¿Está seguro de que desea eliminar este cliente?')) {
      this.formLoading.set(true);
      this.formError.set(null);
      this.clientService.delete(id).subscribe({
        next: () => {
          this.formLoading.set(false);
          this.loadClients(this.currentPage());
        },
        error: () => {
          this.formLoading.set(false);
          this.formError.set('Error al eliminar el cliente.');
        }
      });
    }
  }

  private mapPendingToClient(match: CompanyRequestPending): Client {
    return {
      id: match.client_id,
      client_name: match.client_name,
      ruc: '-',
      description: 'Solicitud pendiente',
      email: '-',
      match_status: match.status
    };
  }
}







