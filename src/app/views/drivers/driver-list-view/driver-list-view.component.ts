import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DriverService } from '../../../services/driver.service';
import { Driver } from '../../../models/driver.model';

@Component({
  selector: 'app-driver-list-view',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './driver-list-view.component.html',
  styleUrl: './driver-list-view.component.css'
})
export class DriverListViewComponent {
  private driverService = inject(DriverService);
  
  drivers = signal<Driver[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  currentPage = signal(1);
  totalCount = signal(0);
  hasNext = signal(false);
  hasPrevious = signal(false);

  constructor() {
    this.loadDrivers(1);
  }

  loadDrivers(page: number = 1) {
    this.loading.set(true);
    this.error.set(null);
    
    this.driverService.getAll(page).subscribe({
      next: (response) => {
        this.drivers.set(response.results);
        this.totalCount.set(response.count);
        this.hasNext.set(response.next !== null);
        this.hasPrevious.set(response.previous !== null);
        this.currentPage.set(page);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar los conductores. Por favor, intente nuevamente.');
        this.loading.set(false);
        console.error('Error loading drivers:', err);
      }
    });
  }

  nextPage() {
    if (this.hasNext()) {
      this.loadDrivers(this.currentPage() + 1);
    }
  }

  previousPage() {
    if (this.hasPrevious()) {
      this.loadDrivers(this.currentPage() - 1);
    }
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

