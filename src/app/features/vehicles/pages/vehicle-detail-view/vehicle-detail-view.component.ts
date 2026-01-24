import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HeroIconComponent } from '@app/shared/ui/hero-icon/hero-icon';
import { VehiclesEditModalComponent } from './components/vehicles-edit-modal/vehicles-edit-modal.component';
import { VehiclesDeleteModalComponent } from './components/vehicles-delete-modal/vehicles-delete-modal.component';
import { VehicleService } from '@app/features/vehicles/services/vehicle.service';
import { Vehicle } from '@app/features/vehicles/models/vehicle.model';
import { EmptyStateComponent } from '@app/shared/ui/empty-state/empty-state.component';
import { LoadingCardComponent } from '@app/shared/ui/loading-card/loading-card.component';

@Component({
  selector: 'app-vehicle-detail-view',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    HeroIconComponent,
    VehiclesEditModalComponent,
    VehiclesDeleteModalComponent,
    EmptyStateComponent,
    LoadingCardComponent
  ],
  templateUrl: './vehicle-detail-view.component.html',
  styleUrl: './vehicle-detail-view.component.css'
})
export class VehicleDetailViewComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private vehicleService = inject(VehicleService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  loading = signal(false);
  error = signal<string | null>(null);
  vehicle = signal<Vehicle | null>(null);
  allyId = signal<string | null>(null);
  allyName = signal<string | null>(null);
  vehicleId = signal<string | null>(null);
  editOpen = signal(false);
  editLoading = signal(false);
  editError = signal<string | null>(null);
  deleteOpen = signal(false);
  deleteLoading = signal(false);
  deleteError = signal<string | null>(null);
  vehicleTypes = [
    { value: 'truck', label: 'Camión Pesado' },
    { value: 'van', label: 'Van Mediana' },
    { value: 'motorcycle', label: 'Motocicleta Cargo' },
    { value: 'tractor-trailer', label: 'Tractor-remolque' }
  ];
  statusOptions = [
    { value: 'available', label: 'Disponible' },
    { value: 'in_route', label: 'En Ruta' },
    { value: 'maintenance', label: 'En Taller' },
    { value: 'inactive', label: 'Inactivo' }
  ];

  editForm = this.fb.group({
    license_plate: ['', [Validators.required, Validators.minLength(5)]],
    brand: [''],
    model: [''],
    year: [new Date().getFullYear(), [Validators.min(1950)]],
    vehicle_type: ['truck', Validators.required],
    color: [''],
    body_type: [''],
    tara_kg: this.fb.control<number | null>(null),
    gross_weight_kg: this.fb.control<number | null>(null),
    net_capacity_kg: this.fb.control<number | null>(null),
    length_m: this.fb.control<number | null>(null),
    width_m: this.fb.control<number | null>(null),
    height_m: this.fb.control<number | null>(null),
    status: ['available']
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.allyId.set(params.get('allyId'));
      const vehicleId = params.get('vehicleId');
      this.vehicleId.set(vehicleId);
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
        if (this.editOpen()) {
          this.patchEditForm(response.result);
        }
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el detalle del vehículo.');
        this.loading.set(false);
      }
    });
  }

  openEditModal(): void {
    const current = this.vehicle();
    if (!current) {
      this.editError.set('No hay datos del vehículo para editar.');
      return;
    }
    this.editError.set(null);
    this.patchEditForm(current);
    this.editOpen.set(true);
  }

  closeEditModal(): void {
    this.editOpen.set(false);
    this.editError.set(null);
  }

  submitEditVehicle(): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    const allyId = this.allyId();
    const vehicleId = this.vehicleId();
    if (!allyId || !vehicleId) {
      this.editError.set('No se encontró el vehículo para actualizar.');
      return;
    }

    const {
      license_plate,
      brand,
      model,
      year,
      vehicle_type,
      color,
      body_type,
      tara_kg,
      gross_weight_kg,
      net_capacity_kg,
      length_m,
      width_m,
      height_m,
      status
    } = this.editForm.getRawValue();

    this.editLoading.set(true);
    this.editError.set(null);

    this.vehicleService.patch(allyId, vehicleId, {
      license_plate: license_plate ?? '',
      brand: brand ?? undefined,
      model: model ?? undefined,
      year: year ?? undefined,
      vehicle_type: (vehicle_type ?? 'truck') as Vehicle['vehicle_type'],
      color: color ?? undefined,
      body_type: body_type ?? undefined,
      tara_kg: this.toUndefinedNumber(tara_kg),
      gross_weight_kg: this.toUndefinedNumber(gross_weight_kg),
      net_capacity_kg: this.toUndefinedNumber(net_capacity_kg),
      length_m: this.toUndefinedNumber(length_m),
      width_m: this.toUndefinedNumber(width_m),
      height_m: this.toUndefinedNumber(height_m),
      status: status ? (status as Vehicle['status']) : undefined
    }).subscribe({
      next: response => {
        if (response.errors && response.errors.length > 0) {
          this.editLoading.set(false);
          this.editError.set('No se pudo actualizar el vehículo.');
          return;
        }
        this.vehicle.set(response.result);
        this.editLoading.set(false);
        this.closeEditModal();
      },
      error: () => {
        this.editLoading.set(false);
        this.editError.set('No se pudo actualizar el vehículo.');
      }
    });
  }

  openDeleteModal(): void {
    if (!this.vehicleId() || !this.allyId()) {
      this.deleteError.set('No se encontró el vehículo para dar de baja.');
      return;
    }
    this.deleteError.set(null);
    this.deleteOpen.set(true);
  }

  closeDeleteModal(): void {
    this.deleteOpen.set(false);
    this.deleteError.set(null);
  }

  confirmDelete(): void {
    const allyId = this.allyId();
    const vehicleId = this.vehicleId();
    if (!allyId || !vehicleId) {
      this.deleteError.set('No se encontró el vehículo para dar de baja.');
      return;
    }

    this.deleteLoading.set(true);
    this.deleteError.set(null);

    this.vehicleService.delete(allyId, vehicleId).subscribe({
      next: () => {
        this.deleteLoading.set(false);
        this.closeDeleteModal();
        this.router.navigate(['/allies', allyId, 'vehicles'], {
          queryParams: { name: this.allyName() ?? undefined }
        });
      },
      error: () => {
        this.deleteLoading.set(false);
        this.deleteError.set('No se pudo dar de baja el vehículo.');
      }
    });
  }

  private patchEditForm(vehicle: Vehicle): void {
    this.editForm.reset({
      license_plate: vehicle.license_plate ?? '',
      brand: vehicle.brand ?? '',
      model: vehicle.model ?? '',
      year: this.toNumber(vehicle.year) ?? new Date().getFullYear(),
      vehicle_type: vehicle.vehicle_type ?? 'truck',
      color: vehicle.color ?? '',
      body_type: vehicle.body_type ?? '',
      tara_kg: this.toNumber(vehicle.tara_kg),
      gross_weight_kg: this.toNumber(vehicle.gross_weight_kg),
      net_capacity_kg: this.toNumber(vehicle.net_capacity_kg),
      length_m: this.toNumber(vehicle.length_m),
      width_m: this.toNumber(vehicle.width_m),
      height_m: this.toNumber(vehicle.height_m),
      status: vehicle.status ?? 'available'
    });
  }

  private toNumber(value?: string | number | null): number | null {
    if (value === undefined || value === null || value === '') return null;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }

  private toUndefinedNumber(value?: number | null): number | undefined {
    return value === null || value === undefined ? undefined : value;
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






