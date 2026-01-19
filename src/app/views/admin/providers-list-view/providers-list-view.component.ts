import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroIconComponent } from '../../../components/hero-icon/hero-icon';
import { ProviderService } from '../../../services/provider.service';
import { Provider, ProviderCreate } from '../../../models/provider.model';
import { ProviderCreateModalComponent} from '../../../components/providers/provider-create-modal/provider-create-modal.component';
import { StorageService } from '../../../services/storage.service';
import { finalize } from 'rxjs';
import { LocalStorageEnums } from '../../../models/local.storage.enums';
import { Ally, StatCard } from './providers-list-view.types';
import { ProvidersStatsCardsComponent } from './components/providers-stats-cards/providers-stats-cards.component';
import { ProvidersToolbarComponent } from './components/providers-toolbar/providers-toolbar.component';
import { ProvidersTableComponent } from './components/providers-table/providers-table.component';
import { ProvidersPaginationComponent } from './components/providers-pagination/providers-pagination.component';

@Component({
  selector: 'app-providers-list-view',
  standalone: true,
  imports: [
    CommonModule,
    HeroIconComponent,
    ProviderCreateModalComponent,
    ProvidersStatsCardsComponent,
    ProvidersToolbarComponent,
    ProvidersTableComponent,
    ProvidersPaginationComponent
  ],
  templateUrl: './providers-list-view.component.html',
  styleUrl: './providers-list-view.component.css'
})
export class AllyListViewComponent implements OnInit {
  private providerService = inject(ProviderService);
  private storageService = inject(StorageService);

  loading = signal(false);
  error = signal<string | null>(null);
  createOpen = signal(false);

  // Tarjetas de estadísticas (se setean con updateStats)
  stats = signal<StatCard[]>([]);

  // Aliados (providers) desde la API
  allies = signal<Ally[]>([]);

  get uniqueStats(): StatCard[] {
    const seen = new Set<string>();
    return this.stats().filter(stat => {
      if (seen.has(stat.label)) {
        return false;
      }
      seen.add(stat.label);
      return true;
    });
  }

  ngOnInit() {
    this.updateStats([]);
    this.loadProviders();
  }

  openCreateModal() {
    this.createOpen.set(true);
  }

  closeCreateModal() {
    this.createOpen.set(false);
  }

  handleProviderSaved(payload: ProviderCreate) {
    this.createOpen.set(false);
  }

  loadProviders() {
    this.loading.set(true);
    this.error.set(null);
    const userType = this.storageService.getItem(LocalStorageEnums.USER_TYPE) ?? 'admin';

    this.providerService.getAll(userType).pipe(
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: (response) => {
        if (response.errors && response.errors.length > 0) {
          this.error.set('Error al cargar los aliados');
          return;
        }

        // Mapear providers del API a aliados con campos de diseño mock
        const mappedAllies: Ally[] = (response.result || []).map((provider, index) => {
          return this.mapProviderToAlly(provider, index);
        });

        this.allies.set(mappedAllies);
        this.totalItems.set(response.pagination?.count || mappedAllies.length);
        
        // Actualizar estadísticas dinámicamente
        this.updateStats(mappedAllies);
        
      },
      error: (err) => {
        console.error('Error loading providers:', err);
        this.error.set('Error al cargar los aliados. Por favor, intente nuevamente.');
      }
    });
  }

  private mapProviderToAlly(provider: Provider, index: number): Ally {
    const mockData = this.generateMockData(provider, index);

    return {
      ...provider,
      name: provider.provider_name,
      status: mockData.status,
      trucks: mockData.trucks,
      motorcycles: mockData.motorcycles,
      drivers: mockData.drivers,
      driverAvatars: mockData.driverAvatars,
      zone: mockData.zone,
      rating: mockData.rating,
      logo: mockData.logo,
      initials: mockData.initials
    };
  }

  // Actualiza las estadísticas basadas en los datos reales
  private updateStats(allies: Ally[]) {
    const totalAllies = allies.length;
    const totalTrucks = allies.reduce((sum, ally) => sum + (ally.trucks || 0), 0);
    const totalMotorcycles = allies.reduce((sum, ally) => sum + (ally.motorcycles || 0), 0);
    const totalDrivers = allies.reduce((sum, ally) => sum + (ally.drivers || 0), 0);
    const activeAllies = allies.filter(ally => ally.status === 'active').length;

    this.stats.set([
      {
        label: 'Total Aliados',
        value: totalAllies,
        subtitle: totalAllies > 0 ? `+${Math.floor(totalAllies * 0.1)} este mes` : 'Sin datos',
        trend: totalAllies > 0 ? 'up' : undefined,
        icon: 'hexagon',
        iconColor: 'blue'
      },
      {
        label: 'Vehículos Disp.',
        value: totalTrucks + totalMotorcycles,
        subtitle: `de ${totalTrucks + totalMotorcycles + 25} totales`,
        icon: 'truck',
        iconColor: 'emerald'
      },
      {
        label: 'Conductores',
        value: totalDrivers,
        subtitle: `${activeAllies} aliados activos`,
        icon: 'user',
        iconColor: 'purple'
      },
      {
        label: 'En Ruta',
        value: Math.floor(totalDrivers * 0.4),
        subtitle: 'Alta demanda',
        icon: 'map-pin',
        iconColor: 'orange'
      }
    ]);
  }

  // Genera datos mock para campos de diseño
  private generateMockData(provider: Provider, index: number) {
    const zones = ['Bogotá D.C. - Norte', 'Medellín - Area Metro', 'Cali - Sur', 'Cundinamarca (Occidente)', 'Nacional'];
    const statuses: ('active' | 'inactive' | 'pending')[] = ['active', 'active', 'active', 'inactive', 'pending'];
    
    // Generar iniciales del nombre
    const initials = provider.provider_name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    return {
      status: statuses[index % statuses.length] as 'active' | 'inactive' | 'pending',
      trucks: Math.floor(Math.random() * 20) + 2,
      motorcycles: Math.floor(Math.random() * 10),
      drivers: Math.floor(Math.random() * 30) + 5,
      driverAvatars: index % 2 === 0 ? [
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDELxPvO_aTCNTt65ZEHWvli8yZu_mx9Lf0dTEAkiZPBUoOhOtGFJKndZSIHfI854-JvU_sUVHsW1d2cvAco4G0iyO2va9XWKMfaJJsr6A-JI7MSTQfee73KPtOpG7lOYGJCHBTIwAslLhLBMtDm9PenQP-FCWuvdJ4RjkBzem_-Ha_YHGMgFDyhO1DN8IJyem2NlJ06BLn5sRrB2yiUzD0ANh_BKn7gbWxgC37iR23c0PcStH3vjg2SGlrfjJXjmSrOwYPRdVejaw9'
      ] : undefined,
      zone: zones[index % zones.length],
      rating: index % 3 === 0 ? null : Number((Math.random() * 2 + 3).toFixed(1)),
      logo: index % 3 === 0 ? undefined : `https://via.placeholder.com/40?text=${initials}`,
      initials: index % 3 === 0 ? initials : undefined
    };
  }

  // Estado de búsqueda y filtros
  searchQuery = signal<string>('');
  currentPage = signal(1);
  totalItems = signal(0);
  itemsPerPage = 5;

  // Filtrar aliados según búsqueda
  get filteredAllies(): Ally[] {
    const query = this.searchQuery().toLowerCase();
    if (!query) {
      return this.allies();
    }

    return this.allies().filter(ally =>
      ally.name.toLowerCase().includes(query) ||
      ally.id?.toLowerCase().includes(query) ||
      ally.provider_name?.toLowerCase().includes(query) ||
      ally.ruc?.toLowerCase().includes(query)
    );
  }

  // Aliados paginados
  get paginatedAllies(): Ally[] {
    const filtered = this.filteredAllies;
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return filtered.slice(start, end);
  }

  // Métodos para la paginación
  get totalPages(): number {
    return Math.ceil(this.filteredAllies.length / this.itemsPerPage);
  }

  get startItem(): number {
    return (this.currentPage() - 1) * this.itemsPerPage + 1;
  }

  get endItem(): number {
    return Math.min(this.currentPage() * this.itemsPerPage, this.filteredAllies.length);
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

  // Estado y etiquetas se calculan en el componente de tabla.
}
