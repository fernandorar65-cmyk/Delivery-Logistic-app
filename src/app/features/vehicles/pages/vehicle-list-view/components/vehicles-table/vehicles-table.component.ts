import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { Vehicle } from '@app/features/vehicles/models/vehicle.model';
import { EmptyStateComponent } from '@app/shared/ui/empty-state/empty-state.component';
import { LoadingCardComponent } from '@app/shared/ui/loading-card/loading-card.component';

@Component({
  selector: 'app-vehicles-table',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    TableModule,
    TagModule,
    ButtonModule,
    TooltipModule,
    EmptyStateComponent,
    LoadingCardComponent
  ],
  templateUrl: './vehicles-table.component.html',
  styleUrl: './vehicles-table.component.css'
})
export class VehiclesTableComponent {
  @Input() loading = false;
  @Input() error: string | null = null;
  @Input() vehicles: Vehicle[] = [];
  @Input() totalFiltered = 0;
  @Input() providerId: string | null = null;
  @Input() providerName: string | null = null;

  getStatusSeverity(status?: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (status) {
      case 'in_route': return 'info';
      case 'available': return 'success';
      case 'maintenance': return 'warn';
      case 'inactive': return 'secondary';
      default: return 'secondary';
    }
  }

  getStatusLabel(status?: string): string {
    if (!status) return 'Desconocido';
    switch (status) {
      case 'in_route': return 'En Ruta';
      case 'available': return 'Disponible';
      case 'maintenance': return 'En Taller';
      case 'inactive': return 'Inactivo';
      default: return status;
    }
  }

  getVehicleTypeLabel(type?: string): string {
    if (!type) return '';
    switch (type) {
      case 'truck': return 'Camión Pesado';
      case 'van': return 'Van Mediana';
      case 'tractor-trailer': return 'Tractor-remolque';
      case 'motorcycle': return 'Motocicleta Cargo';
      default: return type;
    }
  }
}
