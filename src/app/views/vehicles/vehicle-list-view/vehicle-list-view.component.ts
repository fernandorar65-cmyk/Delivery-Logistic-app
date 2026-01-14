import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HeroIconComponent } from '../../../components/hero-icon/hero-icon';
import { VehicleService } from '../../../services/vehicle.service';
import { Vehicle } from '../../../models/vehicle.model';

interface StatCard {
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: string;
  trendValue?: string;
  icon: string;
  iconColor: string;
}

@Component({
  selector: 'app-vehicle-list-view',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, HeroIconComponent],
  templateUrl: './vehicle-list-view.component.html',
  styleUrl: './vehicle-list-view.component.css'
})
export class VehicleListViewComponent implements OnInit {
  private vehicleService = inject(VehicleService);

  loading = signal(false);
  error = signal<string | null>(null);

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

  ngOnInit() {
    this.loadVehicles();
  }

  loadVehicles() {
    this.loading.set(true);
    this.error.set(null);

    this.vehicleService.getAll().subscribe({
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
        
        // Actualizar estadísticas dinámicamente
        this.updateStats(mappedVehicles);
        
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading vehicles:', err);
        // Si el API no existe aún, usar datos mock
        const mockVehicles = this.generateMockVehicles();
        this.vehicles.set(mockVehicles);
        this.totalItems.set(mockVehicles.length);
        this.updateStats(mockVehicles);
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
      provider_name: providers[i],
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

  // Filtrar vehículos según búsqueda y filtros
  get filteredVehicles(): Vehicle[] {
    let filtered = this.vehicles();
    const query = this.searchQuery().toLowerCase();
    const typeFilter = this.vehicleTypeFilter();
    const providerFilter = this.providerFilter();

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

    if (providerFilter) {
      filtered = filtered.filter(vehicle => vehicle.provider_name === providerFilter);
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

  // Métodos para obtener el estado del vehículo
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

  // Obtener lista única de proveedores para el filtro
  get uniqueProviders(): string[] {
    const providers = this.vehicles()
      .map(v => v.provider_name)
      .filter((p): p is string => !!p);
    return Array.from(new Set(providers));
  }

  // Obtener array de páginas para la paginación
  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}
