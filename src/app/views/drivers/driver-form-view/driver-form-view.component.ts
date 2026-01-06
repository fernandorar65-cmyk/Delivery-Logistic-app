import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { DriverService } from '../../../services/driver.service';
import { Driver } from '../../../models/driver.model';

@Component({
  selector: 'app-driver-form-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './driver-form-view.component.html',
  styleUrl: './driver-form-view.component.css'
})
export class DriverFormViewComponent implements OnInit {
  private driverService = inject(DriverService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEditMode = signal(false);
  driverId = signal<string | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  driverForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    first_name: ['', [Validators.required, Validators.minLength(2)]],
    last_name: ['', [Validators.required, Validators.minLength(2)]],
    license_number: ['', [Validators.required, Validators.minLength(5)]]
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && this.route.snapshot.url.some(segment => segment.path === 'edit')) {
      this.isEditMode.set(true);
      this.driverId.set(id);
      this.loadDriver(id);
    }
  }

  loadDriver(id: string) {
    this.loading.set(true);
    this.driverService.getById(id).subscribe({
      next: (driver) => {
        this.driverForm.patchValue({
          email: driver.email || '',
          first_name: driver.first_name || '',
          last_name: driver.last_name || '',
          license_number: driver.license_number || ''
        });
        // En modo edición, el password es opcional
        this.driverForm.get('password')?.clearValidators();
        this.driverForm.get('password')?.updateValueAndValidity();
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar el conductor.');
        this.loading.set(false);
        console.error('Error loading driver:', err);
      }
    });
  }

  onSubmit() {
    if (this.driverForm.valid) {
      this.loading.set(true);
      this.error.set(null);

      const formValue = { ...this.driverForm.value };
      
      // Si estamos editando y no hay password, no lo enviamos
      if (this.isEditMode() && !formValue.password) {
        delete formValue.password;
      }

      if (this.isEditMode() && this.driverId()) {
        // Usar PUT para actualización completa
        this.driverService.update(this.driverId()!, formValue).subscribe({
          next: () => {
            this.router.navigate(['/drivers', this.driverId()]);
          },
          error: (err) => {
            this.error.set('Error al actualizar el conductor.');
            this.loading.set(false);
            console.error('Error updating driver:', err);
          }
        });
      } else {
        this.driverService.create(formValue).subscribe({
          next: (response) => {
            console.log('Respuesta del servidor:', response);
            // Si la respuesta tiene un id, navegamos al detalle
            if (response && response.id) {
              this.router.navigate(['/drivers', response.id]);
            } else {
              // Si no hay id, redirigimos a la lista
              this.router.navigate(['/drivers']);
            }
            this.loading.set(false);
          },
          error: (err) => {
            this.loading.set(false);
            console.error('Error creating driver:', err);
            
            // Manejar diferentes tipos de errores
            if (err.status === 400) {
              this.error.set('Datos inválidos. Por favor, verifica todos los campos.');
            } else if (err.status === 401) {
              this.error.set('No autorizado. Por favor, inicia sesión nuevamente.');
            } else if (err.status === 409) {
              this.error.set('El email o número de licencia ya está registrado.');
            } else if (err.status === 0) {
              this.error.set('Error de conexión. Por favor, verifica tu conexión a internet.');
            } else {
              this.error.set('Error al crear el conductor. Por favor, intenta nuevamente.');
            }
          }
        });
      }
    } else {
      this.driverForm.markAllAsTouched();
    }
  }

  getFieldError(fieldName: string): string {
    const field = this.driverForm.get(fieldName);
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

