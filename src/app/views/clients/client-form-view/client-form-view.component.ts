import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ClientService } from '../../../services/client.service';
import { Client } from '../../../models/client.model';

@Component({
  selector: 'app-client-form-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './client-form-view.component.html',
  styleUrl: './client-form-view.component.css'
})
export class ClientFormViewComponent implements OnInit {
  private clientService = inject(ClientService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEditMode = signal(false);
  clientId = signal<number | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  clientForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    address: ['']
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && this.route.snapshot.url.some(segment => segment.path === 'edit')) {
      this.isEditMode.set(true);
      this.clientId.set(Number(id));
      this.loadClient(Number(id));
    }
  }

  loadClient(id: number) {
    this.loading.set(true);
    this.clientService.getById(id).subscribe({
      next: (client) => {
        this.clientForm.patchValue({
          name: client.name,
          email: client.email,
          phone: client.phone || '',
          address: client.address || ''
        });
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

      const formValue = this.clientForm.value;

      if (this.isEditMode() && this.clientId()) {
        // Usar PUT para actualización completa
        this.clientService.update(this.clientId()!, formValue).subscribe({
          next: () => {
            this.router.navigate(['/clients', this.clientId()]);
          },
          error: (err) => {
            this.error.set('Error al actualizar el cliente.');
            this.loading.set(false);
            console.error('Error updating client:', err);
          }
        });
      } else {
        this.clientService.create(formValue).subscribe({
          next: (client) => {
            this.router.navigate(['/clients', client.id]);
          },
          error: (err) => {
            this.error.set('Error al crear el cliente.');
            this.loading.set(false);
            console.error('Error creating client:', err);
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

