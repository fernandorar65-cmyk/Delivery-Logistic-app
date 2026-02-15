import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClientService } from '@app/features/clients/services/client.service';
import { Client, ClientCheckResponse, ClientCreate } from '@app/features/clients/models/client.model';
import { HeroIconComponent } from '@app/shared/ui/hero-icon/hero-icon';
import { ClientsToolbarComponent } from './components/clients-toolbar/clients-toolbar.component';
import { ClientsTableComponent } from './components/clients-table/clients-table.component';
import { PaginationComponent } from '@app/shared/ui/pagination/pagination.component';
import { ClientsStatsComponent } from './components/clients-stats/clients-stats.component';
import { ClientsFormModalComponent } from './components/clients-form-modal/clients-form-modal.component';
import { ClientsSuccessModalComponent } from './components/clients-success-modal/clients-success-modal.component';
import { StorageService } from '@app/core/storage/storage.service';
import { LocalStorageEnums } from '@app/shared/models/local.storage.enums';
import { normalizeUserType } from '@app/shared/models/user-types';
import { CompanyRequestPending } from '@app/features/clients/models/company-request-pending.model';
import { formatApiErrors, hasApiErrors } from '@app/shared/utils/api-response';
import { CompanyClientMatchResponse } from '@app/features/clients/models/company-client-match.model';
import { catchError, finalize, of } from 'rxjs';
import { ModalComponent } from '@app/shared/ui/modal/modal.component';
import { ConfirmModalComponent } from '@app/shared/ui/confirm-modal/confirm-modal.component';

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
    ClientsSuccessModalComponent,
    ModalComponent,
    ConfirmModalComponent
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
  checkLoading = signal(false);
  checkError = signal<string | null>(null);
  checkSuccess = signal<string | null>(null);
  emailStatus = signal<'idle' | 'checking' | 'unique' | 'exists' | 'error'>('idle');
  checkedClientId = signal<string | null>(null);
  matchRequested = signal(false);
  matchModalOpen = signal(false);
  matchEmail = signal<string | null>(null);
  matchLoading = signal(false);
  matchError = signal<string | null>(null);
  deleteConfirmOpen = signal(false);
  deleteTargetId = signal<string | null>(null);

  clientForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: [''], // PasswordConfirmComponent maneja validación via [required]="!isEditMode"
    client_name: ['', [Validators.required, Validators.minLength(2)]],
    ruc: ['', [Validators.required, Validators.minLength(8)]],
    description: ['']
  });

  ngOnInit(): void {
    const userType = this.storageService.getItem(LocalStorageEnums.USER_TYPE);
    this.isCompanyUser.set(normalizeUserType(userType) === 'company');
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
    this.formError.set(null);
    this.resetEmailCheck();
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
      description: client.description || '',
      password: ''
    });
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.isEditMode.set(false);
    this.editingClientId.set(null);
    this.clientForm.reset();
    this.formError.set(null);
    this.formLoading.set(false);
    this.resetEmailCheck();
    this.closeMatchModal();
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
        if (this.isCompanyUser()) {
          if (this.emailStatus() === 'checking') {
            this.formLoading.set(false);
            this.formError.set('Espera a que termine la verificación del correo.');
            return;
          }
          if (this.emailStatus() === 'exists') {
            this.formLoading.set(false);
            this.openMatchModal();
            return;
          }
        }
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
              this.formError.set(formatApiErrors(response.errors));
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
              this.formError.set(formatApiErrors(err?.error?.errors ?? err?.errors ?? err?.message));
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

  verifyClientEmail(): void {
    if (!this.isCompanyUser() || this.isEditMode()) {
      return;
    }
    const emailValue = (this.clientForm.value.email ?? '').toString().trim().toLowerCase();
    if (!emailValue) {
      this.emailStatus.set('idle');
      this.checkError.set('Ingresa un correo válido para verificar.');
      return;
    }
    if (this.clientForm.get('email')?.invalid) {
      this.emailStatus.set('idle');
      this.checkError.set('Ingresa un correo válido para verificar.');
      return;
    }

    this.checkError.set(null);
    this.checkSuccess.set(null);
    this.emailStatus.set('checking');
    this.checkLoading.set(true);

    this.clientService.checkClientEmail(emailValue).pipe(
      catchError((err) => {
        if (err?.status === 404) {
          this.emailStatus.set('unique');
          this.checkSuccess.set('Correo disponible.');
          return of<ClientCheckResponse>({ errors: [], result: null });
        }
        if (err?.status === 400) {
          this.emailStatus.set('error');
          this.checkError.set('El correo existe, pero no pertenece a un cliente.');
          return of(null);
        }
        this.emailStatus.set('error');
        this.checkError.set(formatApiErrors(err?.error?.errors ?? err?.errors ?? err?.message));
        return of(null);
      }),
      finalize(() => this.checkLoading.set(false))
    ).subscribe((response: ClientCheckResponse | null) => {
      if (!response) return;
      if (hasApiErrors(response)) {
        this.emailStatus.set('error');
        this.checkError.set(formatApiErrors(response.errors));
        return;
      }
      const exists = Boolean(response.result?.id);
      if (exists) {
        this.checkedClientId.set(response.result?.id ?? null);
        this.emailStatus.set('exists');
        this.matchEmail.set(response.result?.user_email ?? emailValue);
        this.openMatchModal();
        return;
      }
      this.emailStatus.set('unique');
      this.checkSuccess.set('Correo disponible.');
    });
  }

  openMatchModal(): void {
    const emailValue = (this.clientForm.value.email ?? '').toString().trim().toLowerCase();
    if (emailValue) {
      this.matchEmail.set(emailValue);
    }
    this.matchError.set(null);
    this.matchModalOpen.set(true);
  }

  closeMatchModal(): void {
    this.matchModalOpen.set(false);
    this.matchError.set(null);
    this.matchLoading.set(false);
  }

  confirmMatchRequest(): void {
    if (this.matchLoading()) return;
    this.matchLoading.set(true);
    this.matchError.set(null);
    this.sendCompanyClientRequest().subscribe({
      next: (response) => {
        if (hasApiErrors(response)) {
          this.matchError.set(formatApiErrors(response.errors));
          this.matchLoading.set(false);
          return;
        }
        this.matchRequested.set(true);
        this.matchLoading.set(false);
        this.closeMatchModal();
        this.closeModal();
        this.loadClients(this.currentPage());
      },
      error: (err) => {
        this.matchLoading.set(false);
        this.matchError.set(formatApiErrors(err?.error?.errors ?? err?.errors ?? err?.message));
      }
    });
  }

  private sendCompanyClientRequest(clientId?: string | null) {
    const companyId = this.storageService.getItem(LocalStorageEnums.ID);
    const resolvedClientId = clientId ?? this.checkedClientId();
    if (!companyId || !resolvedClientId) {
      return of<CompanyClientMatchResponse>({ errors: ['Missing IDs'] });
    }
    return this.clientService.sendCompanyClientRequest({
      company_id: companyId,
      client_id: resolvedClientId
    });
  }

  private resetEmailCheck(): void {
    this.checkLoading.set(false);
    this.checkError.set(null);
    this.checkSuccess.set(null);
    this.emailStatus.set('idle');
    this.checkedClientId.set(null);
    this.matchRequested.set(false);
    this.matchEmail.set(null);
    this.matchModalOpen.set(false);
    this.matchError.set(null);
  }

  // Helpers movidos al componente de tabla.

  openDeleteConfirm(id: string) {
    this.deleteTargetId.set(id);
    this.formError.set(null);
    this.deleteConfirmOpen.set(true);
  }

  closeDeleteConfirm() {
    this.deleteConfirmOpen.set(false);
    this.deleteTargetId.set(null);
    this.formError.set(null);
  }

  confirmDeleteClient() {
    const id = this.deleteTargetId();
    if (!id) return;
    this.formLoading.set(true);
    this.formError.set(null);
    this.clientService.delete(id).subscribe({
      next: () => {
        this.formLoading.set(false);
        this.closeDeleteConfirm();
        this.loadClients(this.currentPage());
      },
      error: () => {
        this.formLoading.set(false);
        this.formError.set('Error al eliminar el cliente.');
      }
    });
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







