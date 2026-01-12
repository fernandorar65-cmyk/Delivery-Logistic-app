import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClientService } from '../../../services/client.service';
import { Client, ClientCreate } from '../../../models/client.model';
import { HeroIconComponent } from '../../../components/hero-icon/hero-icon';

@Component({
  selector: 'app-client-list-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HeroIconComponent],
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

  clientForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    business_name: ['', [Validators.required, Validators.minLength(2)]],
    ruc: ['', [Validators.required, Validators.minLength(8)]]
  });

  constructor() {
    this.loadClients(1);
  }

  loadClients(page: number = 1) {
    this.loading.set(true);
    this.error.set(null);
    
    this.clientService.getAll(page).subscribe({
      next: (response) => {
        this.clients.set(response.results);
        this.totalCount.set(response.count);
        this.hasNext.set(response.next !== null);
        this.hasPrevious.set(response.previous !== null);
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
      business_name: client.business_name || '',
      ruc: client.ruc || ''
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
  }

  onSubmit() {
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
          business_name: formValue.business_name,
          ruc: formValue.ruc
        };

        this.clientService.create(clientPayload).subscribe({
          next: () => {
            this.closeModal();
            this.loadClients(this.currentPage());
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

  deleteClient(id: number) {
    if (confirm('¿Está seguro de que desea eliminar este cliente?')) {
      // Nota: El endpoint DELETE no está disponible para clients según la API
      // Si se necesita, se debería agregar al servicio
      console.log('Delete client:', id);
    }
  }
}

