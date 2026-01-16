import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ClientService } from '../../../services/client.service';
import { Client } from '../../../models/client.model';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './client-form.component.html',
  styleUrl: './client-form.component.css'
})
export class ClientFormComponent implements OnInit {
  private clientService = inject(ClientService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEditMode = signal(false);
  clientId = signal<string | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  clientForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    client_name: ['', [Validators.required, Validators.minLength(2)]],
    ruc: ['', [Validators.required, Validators.minLength(8)]],
    description: ['']
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && this.route.snapshot.url.some(segment => segment.path === 'edit')) {
      this.isEditMode.set(true);
      this.clientId.set(id);
      this.loadClient(id);
    }
  }

  loadClient(id: string) {
    this.loading.set(true);
    this.clientService.getById(id).subscribe({
      next: (response) => {
        if (response.errors && response.errors.length > 0) {
          this.error.set('Error al cargar el cliente.');
          this.loading.set(false);
          return;
        }
        const client = response.result;
        this.clientForm.patchValue({
          email: client.email || '',
          client_name: client.client_name || '',
          ruc: client.ruc || '',
          description: client.description || ''
        });
        // En modo edición, el password es opcional
        this.clientForm.get('password')?.clearValidators();
        this.clientForm.get('password')?.updateValueAndValidity();
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar el cliente.');
        this.loading.set(false);
        console.error('Error loading client:', err);
      }
    });
  }

  onSubmit() {
    if (this.clientForm.valid) {
      this.loading.set(true);
      this.error.set(null);

      const formValue = { ...this.clientForm.value };
      
      // Si estamos editando y no hay password, no lo enviamos
      if (this.isEditMode() && !formValue.password) {
        delete formValue.password;
      }

      if (this.isEditMode() && this.clientId()) {
        this.clientService.update(this.clientId()!, formValue).subscribe({
          next: (response) => {
            if (response.errors && response.errors.length > 0) {
              this.error.set('Error al actualizar el cliente.');
              this.loading.set(false);
              return;
            }
            this.router.navigate(['/clients', response.result.id || this.clientId()]);
          },
          error: (err) => {
            this.error.set('Error al actualizar el cliente.');
            this.loading.set(false);
            console.error('Error updating client:', err);
          }
        });
      } else {
        this.clientService.create(formValue).subscribe({
          next: (response) => {
            if (response.errors && response.errors.length > 0) {
              this.error.set('Error al crear el cliente. Por favor, intenta nuevamente.');
              this.loading.set(false);
              return;
            }
            if (response.result?.id) {
              this.router.navigate(['/clients', response.result.id]);
            } else {
              this.router.navigate(['/clients']);
            }
            this.loading.set(false);
          },
          error: (err) => {
            this.loading.set(false);
            console.error('Error creating client:', err);
            
            if (err.status === 400) {
              this.error.set('Datos inválidos. Por favor, verifica todos los campos.');
            } else if (err.status === 401) {
              this.error.set('No autorizado. Por favor, inicia sesión nuevamente.');
            } else if (err.status === 409) {
              this.error.set('El email o RUC ya está registrado.');
            } else if (err.status === 0) {
              this.error.set('Error de conexión. Por favor, verifica tu conexión a internet.');
            } else {
              this.error.set('Error al crear el cliente. Por favor, intenta nuevamente.');
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
}

