import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { VehiclesEditModalComponent } from './components/vehicles-edit-modal/vehicles-edit-modal.component';
import { VehiclesDeleteModalComponent } from './components/vehicles-delete-modal/vehicles-delete-modal.component';
import { VehicleService } from '@app/features/vehicles/services/vehicle.service';
import { Vehicle } from '@app/features/vehicles/models/vehicle.model';
import { EmptyStateComponent } from '@app/shared/ui/empty-state/empty-state.component';
import { LoadingCardComponent } from '@app/shared/ui/loading-card/loading-card.component';
import { hasApiErrors } from '@app/shared/utils/api-response';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { AvatarModule } from 'primeng/avatar';
import { DividerModule } from 'primeng/divider';
import { ProgressBarModule } from 'primeng/progressbar';
import { TooltipModule } from 'primeng/tooltip';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-vehicle-detail-view',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    VehiclesEditModalComponent,
    VehiclesDeleteModalComponent,
    EmptyStateComponent,
    LoadingCardComponent,
    CardModule,
    TagModule,
    ButtonModule,
    BreadcrumbModule,
    AvatarModule,
    DividerModule,
    ProgressBarModule,
    TooltipModule
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
  providerId = signal<string | null>(null);
  providerName = signal<string | null>(null);
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
      this.providerId.set(params.get('providerId'));
      const vehicleId = params.get('vehicleId');
      this.vehicleId.set(vehicleId);
      if (vehicleId) {
        this.loadVehicle(vehicleId);
      }
    });

    this.route.queryParamMap.subscribe(params => {
      this.providerName.set(params.get('name'));
    });
  }

  private loadVehicle(vehicleId: string): void {
    const providerId = this.providerId();
    if (!providerId) {
      this.error.set('No se encontró el provider para cargar el vehículo.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.vehicleService.getById(providerId, vehicleId).subscribe({
      next: response => {
        if (hasApiErrors(response)) {
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

    const providerId = this.providerId();
    const vehicleId = this.vehicleId();
    if (!providerId || !vehicleId) {
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

    this.vehicleService.patch(providerId, vehicleId, {
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
        if (hasApiErrors(response)) {
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
    if (!this.vehicleId() || !this.providerId()) {
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
    const providerId = this.providerId();
    const vehicleId = this.vehicleId();
    if (!providerId || !vehicleId) {
      this.deleteError.set('No se encontró el vehículo para dar de baja.');
      return;
    }

    this.deleteLoading.set(true);
    this.deleteError.set(null);

    this.vehicleService.delete(providerId, vehicleId).subscribe({
      next: () => {
        this.deleteLoading.set(false);
        this.closeDeleteModal();
        this.router.navigate(['/providers', providerId, 'vehicles'], {
          queryParams: { name: this.providerName() ?? undefined }
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

  get providerLabel(): string {
    const name = this.providerName();
    if (name) return name;
    const id = this.providerId();
    return id ? `Provider #${id}` : 'Provider';
  }

  breadcrumbItems = computed<MenuItem[]>(() => {
    const pid = this.providerId();
    return [
      { label: 'Inicio', routerLink: '/dashboard' },
      { label: 'Providers', routerLink: '/providers' },
      { label: 'Vehículos', routerLink: pid ? ['/providers', pid, 'vehicles'] : [] },
      { label: 'Detalle' }
    ];
  });

  getStatusSeverity(status?: string): 'success' | 'info' | 'warn' | 'secondary' {
    if (!status) return 'secondary';
    switch (status) {
      case 'available':
        return 'success';
      case 'in_route':
        return 'info';
      case 'maintenance':
        return 'warn';
      case 'inactive':
        return 'secondary';
      default:
        return 'secondary';
    }
  }

  getVehicleInitials(plate?: string | null): string {
    if (!plate || !plate.trim()) return 'VH';
    const cleaned = plate.replace(/\s/g, '').toUpperCase();
    if (cleaned.length >= 2) return cleaned.slice(0, 2);
    return cleaned || 'VH';
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

  formatDate(value?: string | null): string {
    if (!value) return '-';
    try {
      const d = new Date(value);
      return Number.isNaN(d.getTime()) ? '-' : d.toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '-';
    }
  }

  getVehicleTypeLabel(type?: string): string {
    if (!type) return '-';
    const normalized = (type || '').toLowerCase().replace(/_/g, '-');
    switch (normalized) {
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






