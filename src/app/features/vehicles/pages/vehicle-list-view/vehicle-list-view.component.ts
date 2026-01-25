import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HeroIconComponent } from '@app/shared/ui/hero-icon/hero-icon';
import { VehicleService } from '@app/features/vehicles/services/vehicle.service';
import { Vehicle } from '@app/features/vehicles/models/vehicle.model';
import { StatCard } from './vehicle-list-view.types';
import { VehiclesStatsComponent } from './components/vehicles-stats/vehicles-stats.component';
import { VehiclesFiltersComponent } from './components/vehicles-filters/vehicles-filters.component';
import { VehiclesTableComponent } from './components/vehicles-table/vehicles-table.component';
import { VehiclesPaginationComponent } from './components/vehicles-pagination/vehicles-pagination.component';
import { VehiclesCreateModalComponent } from './components/vehicles-create-modal/vehicles-create-modal.component';
import { StorageService } from '@app/core/storage/storage.service';
import { LocalStorageEnums } from '@app/shared/models/local.storage.enums';

@Component({
  selector: 'app-vehicle-list-view',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    HeroIconComponent,
    VehiclesStatsComponent,
    VehiclesFiltersComponent,
    VehiclesTableComponent,
    VehiclesPaginationComponent,
    VehiclesCreateModalComponent
  ],
  templateUrl: './vehicle-list-view.component.html',
  styleUrl: './vehicle-list-view.component.css'
})
export class VehicleListViewComponent implements OnInit {
  private vehicleService = inject(VehicleService);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private storageService = inject(StorageService);

  loading = signal(false);
  error = signal<string | null>(null);
  allyId = signal<string | null>(null);
  allyName = signal<string | null>(null);
  createOpen = signal(false);
  createLoading = signal(false);
  createError = signal<string | null>(null);
  vehicleTypes = [
    { value: 'truck', label: 'Camión Pesado' },
    { value: 'van', label: 'Van de Reparto' },
    { value: 'motorcycle', label: 'Motocicleta Cargo' },
    { value: 'tractor-trailer', label: 'Tractor-remolque' }
  ];
  statusOptions = [
    { value: 'available', label: 'Activo / Disponible' },
    { value: 'in_route', label: 'En Ruta' },
    { value: 'maintenance', label: 'En Mantenimiento' },
    { value: 'inactive', label: 'Inactivo' }
  ];

  // Datos mock para las tarjetas de estadísticas
  stats = signal<StatCard[]>([
    {
      label: 'Total Vehículos',
      value: 124,
      trend: 'up',
      trendValue: '+5.2%',
      icon: 'truck',
      iconColor: 'primary'
    },
    {
      label: 'En Ruta',
      value: 82,
      trend: 'up',
      trendValue: '+2.1%',
      icon: 'map-pin',
      iconColor: 'blue'
    },
    {
      label: 'En Mantenimiento',
      value: 12,
      trend: 'down',
      trendValue: '-1.4%',
      icon: 'wrench-screwdriver',
      iconColor: 'orange'
    },
    {
      label: 'Disponibles',
      value: 30,
      trend: 'down',
      trendValue: '-3.0%',
      icon: 'check-circle',
      iconColor: 'green'
    }
  ]);

  // Vehículos desde la API
  vehicles = signal<Vehicle[]>([]);

  createForm = this.fb.group({
    license_plate: ['', [Validators.required, Validators.minLength(5)]],
    brand: [''],
    model: [''],
    year: [new Date().getFullYear(), [Validators.min(1950)]],
    vehicle_type: ['truck', Validators.required],
    color: [''],
    body_type: [''],
    tara_kg: [''],
    gross_weight_kg: [''],
    net_capacity_kg: [''],
    length_m: [''],
    width_m: [''],
    height_m: [''],
    status: ['available'],
    fuel_type: [''],
    volume_m3: [''],
    owner_document: [''],
    photo_url: ['']
  });

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.allyId.set(params.get('allyId'));
      this.currentPage.set(1);
      this.loadVehicles();
    });

    this.route.queryParamMap.subscribe(params => {
      this.allyName.set(params.get('name'));
    });

    if (!this.allyId()) {
      this.allyId.set(this.getProviderId());
    }
  }

  openCreateModal() {
    const allyId = this.getProviderId();
    if (!allyId) {
      this.createError.set('No se encontró el aliado para registrar el vehículo.');
      return;
    }
    this.createError.set(null);
    this.createForm.reset({
      license_plate: '',
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      vehicle_type: 'truck',
      color: '',
      body_type: '',
      tara_kg: '',
      gross_weight_kg: '',
      net_capacity_kg: '',
      length_m: '',
      width_m: '',
      height_m: '',
      status: 'available',
      fuel_type: '',
      volume_m3: '',
      owner_document: '',
      photo_url: ''
    });
    this.createOpen.set(true);
  }

  closeCreateModal() {
    this.createOpen.set(false);
  }

  submitCreateVehicle() {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    const allyId = this.getProviderId();
    if (!allyId) {
      this.createError.set('No se encontró el aliado para registrar el vehículo.');
      return;
    }

    this.createLoading.set(true);
    this.createError.set(null);

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
    } = this.createForm.getRawValue();

    this.vehicleService.create(allyId, {
      license_plate: license_plate ?? '',
      brand: brand ?? undefined,
      model: model ?? undefined,
      year: year ?? undefined,
      vehicle_type: (vehicle_type ?? 'truck') as Vehicle['vehicle_type'],
      color: color ?? undefined,
      body_type: body_type ?? undefined,
      tara_kg: tara_kg ?? undefined,
      gross_weight_kg: gross_weight_kg ?? undefined,
      net_capacity_kg: net_capacity_kg ?? undefined,
      length_m: length_m ?? undefined,
      width_m: width_m ?? undefined,
      height_m: height_m ?? undefined,
      status: status ? (status as Vehicle['status']) : undefined
    }).subscribe({
      next: (response) => {
        if (response.errors && response.errors.length > 0) {
          this.createLoading.set(false);
          this.createError.set('No se pudo registrar el vehículo. Intenta nuevamente.');
          return;
        }
        this.createLoading.set(false);
        this.closeCreateModal();
        this.loadVehicles();
      },
      error: () => {
        this.createLoading.set(false);
        this.createError.set('No se pudo registrar el vehículo. Intenta nuevamente.');
      }
    });
  }

  private getProviderId(): string | null {
    return this.storageService.getItem(LocalStorageEnums.ID);
  }

  loadVehicles() {
    this.loading.set(true);
    this.error.set(null);
    const allyId = this.storageService.getItem(LocalStorageEnums.USER_ID);

    if (!allyId) {
      this.error.set('No se encontró el aliado para cargar vehículos.');
      this.loading.set(false);
      this.vehicles.set([]);
      this.totalItems.set(0);
      return;
    }

    this.vehicleService.getByProvider(allyId).subscribe({
      next: (response) => {
        if (response.errors && response.errors.length > 0) {
          this.error.set('Error al cargar los vehículos');
          this.loading.set(false);
          return;
        }

        // Mapear vehículos del API con campos de diseño mock
        const mappedVehicles: Vehicle[] = (response.result || []).map((vehicle, index) => {
          return this.mapVehicleWithMockData(vehicle, index);
        });

        this.vehicles.set(mappedVehicles);
        this.totalItems.set(response.pagination?.count || mappedVehicles.length);
        this.syncAllyName(mappedVehicles);

        // Actualizar estadísticas dinámicamente
        this.updateStats(this.scopedVehicles);
        
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading vehicles:', err);
        // Si el API no existe aún, usar datos mock
        const mockVehicles = this.generateMockVehicles();
        this.vehicles.set(mockVehicles);
        this.totalItems.set(mockVehicles.length);
        this.syncAllyName(mockVehicles);
        this.updateStats(this.scopedVehicles);
        this.loading.set(false);
      }
    });
  }

  // Mapea un vehículo del API con datos mock para diseño
  private mapVehicleWithMockData(vehicle: Vehicle, index: number): Vehicle {
    const mockData = this.generateVehicleMockData(vehicle, index);
    return {
      ...vehicle,
      image: mockData.image,
      year: mockData.year
    };
  }

  // Genera datos mock para vehículos
  private generateVehicleMockData(vehicle: Vehicle, index: number) {
    const vehicleImages = [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBlXz1CXYYmU1xDZZxYQXm98XL0wFtU8Y0XwOJTJ8aLIeFqVSlE5S5Ot_zPnkgjTabJsH-TV7OzjJH1GHnjn5FXlpuOcMkKtxEJoMY-dO4rGHxHOB4Sk6XSvu8_RjI77snqzV4unQ2vOW6949WV8doD3qL3SCXjsOrbLiag7TJOxguPMzIOgnlyQgPOV-3f_365oo9pmxEjx45e4Mw1q7XI4eNf80Y4kIa-c586Mf5FReE-QFtUVrYgA6jB7B5_oGLOL6LCn8e09ryU',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCNQig2tQsdoMXblotzEDaRfhbfoyzlyF1EWtJ12UXc5vN8iXzxR6SMlzZM2ZBehI8P7ADftEJaaElhtiIs_ELI3kMeLRSM-UQ-VLbtQ1PH6Bj5TlJOO7BAAl8x7dwrJ7r_2kN--Dn-wFQhMACKENGQdavTTvoBiZsMih_Gy-Eugr9kXDCO_r-Rhx4D8H0ds3__t_Wl5JoD2XkKDYBg4pJ-wbPU4vfOgrfnSwyjpTPCm9RI51BmpkvSTtkJ4vVoh_xz4t4DHO_Pq8rB',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBdSeww3QfTsXKTpC72EZt1bRvWtSISMl9wnQHDSqlWHc1CQgQ_5pcYfkMCVnJgHgS0I1Ds-QSSI2XCzegk-zgqSIErfqp-1MCueBQXccytYkMxzS5nVN86W2I3fYhUV0D001yQOymNRXevPIJZn5h2Yh4f1S4xzecdJ98DGfLyZC5jATfhFtNC6_W3r6oSB8jv8ZTSxC7kvj3HnsMV1fnnCICiAxrdh230Oovg_91GgRhujb7AN-dee5w5xEPET5VyOMPL9J1zV6KK',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAdEHW4znSnlcWXiuRz0nJ1P1HIWn3UnsCgfspfQ_WBPoddzIjTg8DaqsC0lhT5mvhY0SHQ_Nkdbp3uOlqzz4kn7-yRkYrcYLbZTpdfaUfg2Rz1JOFdZ001IN2S9RXGWbUkFB-EvolCJtw4oMRT5dzwulQeTFwQtPI-WIlpWXIC8elj8cmTmE67VwscHwImD_FRy-ZRQ-LEb2A24k_23S71B3e2F36bpzFpWuQ7xt-r5rSXiMoGpPPiH0A5rCo_79n76MYoPoGpEDm'
    ];

    return {
      image: vehicleImages[index % vehicleImages.length],
      year: 2020 + (index % 5)
    };
  }

  // Genera vehículos mock si el API no está disponible
  private generateMockVehicles(): Vehicle[] {
    const providers = ['Transportes Express', 'Logística Global', 'Propietario Aliado SA', 'Independiente'];
    const providerIds = ['1', '2', '3', '4'];
    const forcedProviderId = this.allyId();
    const forcedProviderName = this.allyName();
    const types: Vehicle['vehicle_type'][] = ['truck', 'van', 'tractor-trailer', 'motorcycle'];
    const statuses: Vehicle['status'][] = ['in_route', 'available', 'maintenance', 'in_route'];
    const models = ['Volvo FH16', 'Mercedes Sprinter', 'Kenworth T680', 'Yamaha FZ-S'];
    const capacities = ['15 Toneladas', '3.5 Toneladas', '30 Toneladas', '0.5 Toneladas'];
    const plates = ['ABC-1234', 'XYZ-5678', 'TRK-9900', 'MOT-4422'];

    return Array.from({ length: 4 }, (_, i) => ({
      id: `#0012${4 + i}`,
      license_plate: plates[i],
      vehicle_type: types[i],
      model: models[i],
      brand: models[i].split(' ')[0],
      capacity: capacities[i],
      provider_id: forcedProviderId ?? providerIds[i],
      provider_name: forcedProviderName ?? providers[i],
      status: statuses[i],
      ...this.generateVehicleMockData({} as Vehicle, i)
    }));
  }

  // Actualiza las estadísticas basadas en los datos reales
  private updateStats(vehicles: Vehicle[]) {
    const total = vehicles.length;
    const inRoute = vehicles.filter(v => v.status === 'in_route').length;
    const maintenance = vehicles.filter(v => v.status === 'maintenance').length;
    const available = vehicles.filter(v => v.status === 'available').length;

    this.stats.set([
      {
        label: 'Total Vehículos',
        value: total,
        trend: 'up',
        trendValue: '+5.2%',
        icon: 'truck',
        iconColor: 'primary'
      },
      {
        label: 'En Ruta',
        value: inRoute,
        trend: 'up',
        trendValue: '+2.1%',
        icon: 'map-pin',
        iconColor: 'blue'
      },
      {
        label: 'En Mantenimiento',
        value: maintenance,
        trend: 'down',
        trendValue: '-1.4%',
        icon: 'wrench-screwdriver',
        iconColor: 'orange'
      },
      {
        label: 'Disponibles',
        value: available,
        trend: 'down',
        trendValue: '-3.0%',
        icon: 'check-circle',
        iconColor: 'green'
      }
    ]);
  }

  // Estado de búsqueda y filtros
  searchQuery = signal<string>('');
  vehicleTypeFilter = signal<string>('');
  providerFilter = signal<string>('');
  currentPage = signal(1);
  totalItems = signal(0);
  itemsPerPage = 10;

  get allyLabel(): string {
    const name = this.allyName();
    if (name) return name;
    const id = this.allyId();
    return id ? `Aliado #${id}` : 'Flota';
  }

  get pageTitle(): string {
    return this.allyId() ? `Vehículos de ${this.allyLabel}` : 'Administración de Flota';
  }

  get pageSubtitle(): string {
    return this.allyId()
      ? 'Supervisión operativa de la flota asignada al aliado.'
      : 'Supervisión operativa y asignación técnica de unidades.';
  }

  // Filtra por aliado seleccionado cuando aplica
  get scopedVehicles(): Vehicle[] {
    const allyId = this.allyId();
    const allyName = this.allyName();
    if (!allyId && !allyName) {
      return this.vehicles();
    }

    return this.vehicles().filter(vehicle => {
      const matchesId = allyId && vehicle.provider_id ? vehicle.provider_id === allyId : false;
      const matchesName = allyName && vehicle.provider_name ? vehicle.provider_name === allyName : false;
      return matchesId || matchesName;
    });
  }

  // Filtrar vehículos según búsqueda y filtros
  get filteredVehicles(): Vehicle[] {
    let filtered = this.scopedVehicles;
    const query = this.searchQuery().toLowerCase();
    const typeFilter = this.vehicleTypeFilter();

    if (query) {
      filtered = filtered.filter(vehicle =>
        vehicle.license_plate?.toLowerCase().includes(query) ||
        vehicle.model?.toLowerCase().includes(query) ||
        vehicle.brand?.toLowerCase().includes(query) ||
        vehicle.provider_name?.toLowerCase().includes(query)
      );
    }

    if (typeFilter) {
      filtered = filtered.filter(vehicle => vehicle.vehicle_type === typeFilter);
    }

    return filtered;
  }

  // Vehículos paginados
  get paginatedVehicles(): Vehicle[] {
    const filtered = this.filteredVehicles;
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return filtered.slice(start, end);
  }

  // Métodos para la paginación
  get totalPages(): number {
    return Math.ceil(this.filteredVehicles.length / this.itemsPerPage);
  }

  get startItem(): number {
    return (this.currentPage() - 1) * this.itemsPerPage + 1;
  }

  get endItem(): number {
    return Math.min(this.currentPage() * this.itemsPerPage, this.filteredVehicles.length);
  }

  previousPage() {
    if (this.currentPage() > 1) {
      this.currentPage.set(this.currentPage() - 1);
    }
  }

  nextPage() {
    if (this.currentPage() < this.totalPages) {
      this.currentPage.set(this.currentPage() + 1);
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage.set(page);
    }
  }

  // Etiquetas y estados se resuelven en el componente de tabla.

  // Obtener array de páginas para la paginación
  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  private syncAllyName(vehicles: Vehicle[]) {
    if (this.allyName() || !this.allyId()) return;
    const match = vehicles.find(vehicle => vehicle.provider_id === this.allyId());
    if (match?.provider_name) {
      this.allyName.set(match.provider_name);
    }
  }
}






