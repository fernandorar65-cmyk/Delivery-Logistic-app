import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DriverService } from '../../../services/driver.service';
import { Driver } from '../../../models/driver.model';

@Component({
  selector: 'app-driver-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './driver-list.component.html',
  styleUrl: './driver-list.component.css'
})
export class DriverListComponent {
  private driverService = inject(DriverService);
  
  drivers = signal<Driver[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor() {
    this.loadDrivers();
  }

  loadDrivers(page: number = 1) {
    this.loading.set(true);
    this.error.set(null);
    
    this.driverService.getAll(page).subscribe({
      next: (response) => {
        this.drivers.set(response.results);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar los conductores. Por favor, intente nuevamente.');
        this.loading.set(false);
        console.error('Error loading drivers:', err);
      }
    });
  }

  deleteDriver(id: number) {
    if (confirm('¿Está seguro de que desea eliminar este conductor?')) {
      this.loading.set(true);
      this.driverService.delete(id).subscribe({
        next: () => {
          this.loadDrivers();
        },
        error: (err) => {
          this.error.set('Error al eliminar el conductor.');
          this.loading.set(false);
          console.error('Error deleting driver:', err);
        }
      });
    }
  }
}

