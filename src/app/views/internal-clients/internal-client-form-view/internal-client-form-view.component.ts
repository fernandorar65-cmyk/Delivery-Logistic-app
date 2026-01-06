import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { InternalClientService } from '../../../services/internal-client.service';
import { InternalClient } from '../../../models/internal-client.model';

@Component({
  selector: 'app-internal-client-form-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './internal-client-form-view.component.html',
  styleUrl: './internal-client-form-view.component.css'
})
export class InternalClientFormViewComponent implements OnInit {
  private internalClientService = inject(InternalClientService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEditMode = signal(false);
  internalClientId = signal<string | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  internalClientForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && this.route.snapshot.url.some(segment => segment.path === 'edit')) {
      this.isEditMode.set(true);
      this.internalClientId.set(id);
      this.loadInternalClient(id);
    }
  }

  loadInternalClient(id: string) {
    this.loading.set(true);
    this.internalClientService.getById(id).subscribe({
      next: (internalClient) => {
        this.internalClientForm.patchValue({
          email: internalClient.email || ''
        });
        // En modo edición, el password es opcional
        this.internalClientForm.get('password')?.clearValidators();
        this.internalClientForm.get('password')?.updateValueAndValidity();
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar el cliente interno.');
        this.loading.set(false);
        console.error('Error loading internal client:', err);
      }
    });
  }

  onSubmit() {
    if (this.internalClientForm.valid) {
      this.loading.set(true);
      this.error.set(null);

      const formValue = { ...this.internalClientForm.value };
      
      // Si estamos editando y no hay password, no lo enviamos
      if (this.isEditMode() && !formValue.password) {
        delete formValue.password;
      }

      if (this.isEditMode() && this.internalClientId()) {
        this.internalClientService.update(this.internalClientId()!, formValue).subscribe({
          next: () => {
            this.router.navigate(['/internal-clients', this.internalClientId()]);
          },
          error: (err) => {
            this.error.set('Error al actualizar el cliente interno.');
            this.loading.set(false);
            console.error('Error updating internal client:', err);
          }
        });
      } else {
        this.internalClientService.create(formValue).subscribe({
          next: (response) => {
            console.log('Respuesta del servidor:', response);
            // Si la respuesta tiene un id, navegamos al detalle
            if (response && response.id) {
              this.router.navigate(['/internal-clients', response.id]);
            } else {
              // Si no hay id, redirigimos a la lista
              this.router.navigate(['/internal-clients']);
            }
            this.loading.set(false);
          },
          error: (err) => {
            this.loading.set(false);
            console.error('Error creating internal client:', err);
            
            // Manejar diferentes tipos de errores
            if (err.status === 400) {
              this.error.set('Datos inválidos. Por favor, verifica el email y la contraseña.');
            } else if (err.status === 409) {
              this.error.set('El email ya está registrado.');
            } else if (err.status === 0) {
              this.error.set('Error de conexión. Por favor, verifica tu conexión a internet.');
            } else {
              this.error.set('Error al crear el cliente interno. Por favor, intenta nuevamente.');
            }
          }
        });
      }
    } else {
      this.internalClientForm.markAllAsTouched();
    }
  }

  getFieldError(fieldName: string): string {
    const field = this.internalClientForm.get(fieldName);
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

