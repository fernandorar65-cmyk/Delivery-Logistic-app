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
  internalClientId = signal<number | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  internalClientForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['']
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && this.route.snapshot.url.some(segment => segment.path === 'edit')) {
      this.isEditMode.set(true);
      this.internalClientId.set(Number(id));
      this.loadInternalClient(Number(id));
    }
  }

  loadInternalClient(id: number) {
    this.loading.set(true);
    this.internalClientService.getById(id).subscribe({
      next: (internalClient) => {
        this.internalClientForm.patchValue({
          name: internalClient.name,
          email: internalClient.email,
          phone: internalClient.phone || ''
        });
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

      const formValue = this.internalClientForm.value;

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
          next: (internalClient) => {
            this.router.navigate(['/internal-clients', internalClient.id]);
          },
          error: (err) => {
            this.error.set('Error al crear el cliente interno.');
            this.loading.set(false);
            console.error('Error creating internal client:', err);
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

