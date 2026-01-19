import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HeroIconComponent } from '../../../../../../components/hero-icon/hero-icon';
import { Vehicle } from '../../../../../../models/vehicle.model';
import { EmptyStateComponent } from '../../../../../../shared/ui/empty-state/empty-state.component';
import { LoadingCardComponent } from '../../../../../../shared/ui/loading-card/loading-card.component';

@Component({
  selector: 'app-vehicles-table',
  standalone: true,
  imports: [CommonModule, RouterLink, HeroIconComponent, EmptyStateComponent, LoadingCardComponent],
  templateUrl: './vehicles-table.component.html',
  styleUrl: './vehicles-table.component.css'
})
export class VehiclesTableComponent {
  @Input() loading = false;
  @Input() error: string | null = null;
  @Input() vehicles: Vehicle[] = [];
  @Input() totalFiltered = 0;
  @Input() allyId: string | null = null;
  @Input() allyName: string | null = null;

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

  getStatusLabel(status?: string): string {
    if (!status) return 'Desconocido';
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

  getVehicleTypeLabel(type?: string): string {
    if (!type) return '';
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
