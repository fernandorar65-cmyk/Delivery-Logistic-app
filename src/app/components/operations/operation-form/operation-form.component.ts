import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { OperationService } from '../../../services/operation.service';
import { DriverService } from '../../../services/driver.service';
import { Operation } from '../../../models/operation.model';
import { Driver } from '../../../models/driver.model';

@Component({
  selector: 'app-operation-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './operation-form.component.html',
  styleUrl: './operation-form.component.css'
})
export class OperationFormComponent implements OnInit {
  private operationService = inject(OperationService);
  private driverService = inject(DriverService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEditMode = signal(false);
  operationId = signal<string | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  drivers = signal<Driver[]>([]);
  loadingDrivers = signal(false);

  operationForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: ['', [Validators.required]],
    is_active: [true],
    is_finalized: [false],
    driver: ['', [Validators.required]]
  });

  ngOnInit() {
    this.loadDrivers();
    const id = this.route.snapshot.paramMap.get('id');
    if (id && this.route.snapshot.url.some(segment => segment.path === 'edit')) {
      this.isEditMode.set(true);
      this.operationId.set(id);
      this.loadOperation(id);
    }
  }

  loadDrivers() {
    this.loadingDrivers.set(true);
    this.driverService.getAll(1).subscribe({
      next: (response) => {
        this.drivers.set(response.results);
        this.loadingDrivers.set(false);
      },
      error: (err) => {
        console.error('Error loading drivers:', err);
        this.loadingDrivers.set(false);
      }
    });
  }

  loadOperation(id: string) {
    this.loading.set(true);
    this.operationService.getById(id).subscribe({
      next: (operation) => {
        this.operationForm.patchValue({
          name: operation.name || '',
          description: operation.description || '',
          is_active: operation.is_active ?? true,
          is_finalized: operation.is_finalized ?? false,
          driver: operation.driver || ''
        });
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar la operación.');
        this.loading.set(false);
        console.error('Error loading operation:', err);
      }
    });
  }

  onSubmit() {
    if (this.operationForm.valid) {
      this.loading.set(true);
      this.error.set(null);

      const formValue = { ...this.operationForm.value };

      if (this.isEditMode() && this.operationId()) {
        this.operationService.update(this.operationId()!, formValue).subscribe({
          next: () => {
            this.router.navigate(['/operations', this.operationId()]);
          },
          error: (err) => {
            this.error.set('Error al actualizar la operación.');
            this.loading.set(false);
            console.error('Error updating operation:', err);
          }
        });
      } else {
        this.operationService.create(formValue).subscribe({
          next: (response) => {
            if (response && response.id) {
              this.router.navigate(['/operations', response.id]);
            } else {
              this.router.navigate(['/operations']);
            }
            this.loading.set(false);
          },
          error: (err) => {
            this.loading.set(false);
            console.error('Error creating operation:', err);
            
            if (err.status === 400) {
              this.error.set('Datos inválidos. Por favor, verifica todos los campos.');
            } else if (err.status === 401) {
              this.error.set('No autorizado. Por favor, inicia sesión nuevamente.');
            } else if (err.status === 0) {
              this.error.set('Error de conexión. Por favor, verifica tu conexión a internet.');
            } else {
              this.error.set('Error al crear la operación. Por favor, intenta nuevamente.');
            }
          }
        });
      }
    } else {
      this.operationForm.markAllAsTouched();
    }
  }

  getFieldError(fieldName: string): string {
    const field = this.operationForm.get(fieldName);
    if (field?.hasError('required')) {
      return 'Este campo es requerido';
    }
    if (field?.hasError('minlength')) {
      return `Mínimo ${field.errors!['minlength'].requiredLength} caracteres`;
    }
    return '';
  }
}

