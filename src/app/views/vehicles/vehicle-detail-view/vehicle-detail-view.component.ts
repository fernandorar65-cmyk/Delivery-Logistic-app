import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HeroIconComponent } from '../../../components/hero-icon/hero-icon';
import { VehicleService } from '../../../services/vehicle.service';
import { Vehicle } from '../../../models/vehicle.model';

@Component({
  selector: 'app-vehicle-detail-view',
  standalone: true,
  imports: [CommonModule, RouterLink, HeroIconComponent],
  templateUrl: './vehicle-detail-view.component.html',
  styleUrl: './vehicle-detail-view.component.css'
})
export class VehicleDetailViewComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private vehicleService = inject(VehicleService);

  loading = signal(false);
  error = signal<string | null>(null);
  vehicle = signal<Vehicle | null>(null);
  allyId = signal<string | null>(null);
  allyName = signal<string | null>(null);

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.allyId.set(params.get('allyId'));
      const vehicleId = params.get('vehicleId');
      if (vehicleId) {
        this.loadVehicle(vehicleId);
      }
    });

    this.route.queryParamMap.subscribe(params => {
      this.allyName.set(params.get('name'));
    });
  }

  private loadVehicle(vehicleId: string): void {
    const allyId = this.allyId();
    if (!allyId) {
      this.error.set('No se encontró el aliado para cargar el vehículo.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.vehicleService.getById(allyId, vehicleId).subscribe({
      next: response => {
        if (response.errors && response.errors.length > 0) {
          this.error.set('No se pudo cargar el detalle del vehículo.');
          this.loading.set(false);
          return;
        }
        this.vehicle.set(response.result);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el detalle del vehículo.');
        this.loading.set(false);
      }
    });
  }

  get allyLabel(): string {
    const name = this.allyName();
    if (name) return name;
    const id = this.allyId();
    return id ? `Aliado #${id}` : 'Aliado';
  }

  getStatusLabel(status?: string): string {
    if (!status) return 'Sin estado';
    switch (status) {
      case 'in_route':
        return 'En Ruta';
      case 'available':
        return 'Disponible';
      case 'maintenance':
        return 'En Taller';
      case 'inactive':
        return 'Inactivo';
      default:
        return status;
    }
  }

  getStatusClass(status?: string): string {
    if (!status) return '';
    switch (status) {
      case 'in_route':
        return 'status-in-route';
      case 'available':
        return 'status-available';
      case 'maintenance':
        return 'status-maintenance';
      case 'inactive':
        return 'status-inactive';
      default:
        return '';
    }
  }

  getVehicleTypeLabel(type?: string): string {
    if (!type) return '-';
    switch (type) {
      case 'truck':
        return 'Camión Pesado';
      case 'van':
        return 'Van Mediana';
      case 'tractor-trailer':
        return 'Tractor-remolque';
      case 'motorcycle':
        return 'Motocicleta Cargo';
      default:
        return type;
    }
  }
}
