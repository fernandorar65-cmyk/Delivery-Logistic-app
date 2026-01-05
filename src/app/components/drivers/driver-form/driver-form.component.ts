import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { DriverService } from '../../../services/driver.service';
import { Driver } from '../../../models/driver.model';

@Component({
  selector: 'app-driver-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './driver-form.component.html',
  styleUrl: './driver-form.component.css'
})
export class DriverFormComponent implements OnInit {
  private driverService = inject(DriverService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEditMode = signal(false);
  driverId = signal<number | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  driverForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    license_number: [''],
    vehicle_type: ['']
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && this.route.snapshot.url.some(segment => segment.path === 'edit')) {
      this.isEditMode.set(true);
      this.driverId.set(Number(id));
      this.loadDriver(Number(id));
    }
  }

  loadDriver(id: number) {
    this.loading.set(true);
    this.driverService.getById(id).subscribe({
      next: (driver) => {
        this.driverForm.patchValue({
          name: driver.name,
          email: driver.email,
          phone: driver.phone || '',
          license_number: driver.license_number || '',
          vehicle_type: driver.vehicle_type || ''
        });
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

      const formValue = this.driverForm.value;

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
          next: (driver) => {
            this.router.navigate(['/drivers', driver.id]);
          },
          error: (err) => {
            this.error.set('Error al crear el conductor.');
            this.loading.set(false);
            console.error('Error creating driver:', err);
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

