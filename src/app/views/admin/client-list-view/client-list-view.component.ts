import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ClientService } from '../../../services/client.service';
import { Client, ClientCreate } from '../../../models/client.model';
import { HeroIconComponent } from '../../../components/hero-icon/hero-icon';

@Component({
  selector: 'app-client-list-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, HeroIconComponent],
  templateUrl: './client-list-view.component.html',
  styleUrl: './client-list-view.component.css'
})
export class ClientListViewComponent {
  private clientService = inject(ClientService);
  private fb = inject(FormBuilder);
  
  clients = signal<Client[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  currentPage = signal(1);
  totalCount = signal(0);
  hasNext = signal(false);
  hasPrevious = signal(false);
  
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

  constructor() {
    this.loadClients(1);
  }

  loadClients(page: number = 1) {
    this.loading.set(true);
    this.error.set(null);
    
    this.clientService.getAll(page).subscribe({
      next: (response) => {
        if (response.errors && response.errors.length > 0) {
          this.error.set('Error al cargar los clientes. Por favor, intente nuevamente.');
          this.loading.set(false);
          return;
        }

        const results = response.result || [];
        this.clients.set(results);
        this.totalCount.set(response.pagination?.count ?? results.length);
        this.hasNext.set(!!response.pagination?.next);
        this.hasPrevious.set(!!response.pagination?.previous);
        this.currentPage.set(page);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar los clientes. Por favor, intente nuevamente.');
        this.loading.set(false);
        console.error('Error loading clients:', err);
      }
    });
  }

  nextPage() {
    if (this.hasNext()) {
      this.loadClients(this.currentPage() + 1);
    }
  }

  previousPage() {
    if (this.hasPrevious()) {
      this.loadClients(this.currentPage() - 1);
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
          next: () => {
            this.formLoading.set(false);
            this.closeModal();
            this.loadClients(this.currentPage());
          },
          error: (err) => {
            this.formError.set('Error al actualizar el cliente.');
            this.formLoading.set(false);
            console.error('Error updating client:', err);
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
            if (response.errors && response.errors.length > 0) {
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
            console.error('Error creating client:', err);
            
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

  getFieldError(fieldName: string): string {
    const field = this.clientForm.get(fieldName);
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

  getInitials(name: string): string {
    const words = name?.trim().split(/\s+/) ?? [];
    if (words.length === 0) return '--';
    const first = words[0]?.[0] ?? '';
    const second = words.length > 1 ? words[1]?.[0] ?? '' : words[0]?.[1] ?? '';
    return (first + second).toUpperCase();
  }

  getAvatarStyle(name: string) {
    const palette = [
      { bg: '#e0f2fe', text: '#0369a1' },
      { bg: '#ede9fe', text: '#6d28d9' },
      { bg: '#dbeafe', text: '#1d4ed8' },
      { bg: '#fee2e2', text: '#b91c1c' },
      { bg: '#dcfce7', text: '#15803d' }
    ];
    const index = Math.abs(this.hashCode(name)) % palette.length;
    return {
      'background-color': palette[index].bg,
      color: palette[index].text
    };
  }

  private hashCode(value: string): number {
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      hash = (hash << 5) - hash + value.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }

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
}

