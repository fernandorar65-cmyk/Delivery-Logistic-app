import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, signal, ViewChild } from '@angular/core';
import type { Map as LeafletMap, Marker as LeafletMarker } from 'leaflet';

export type OrderStatus = 'pending' | 'in_progress' | 'delivered' | 'alert';

export interface OrderWithLocation {
  id: string;
  routeId: string;
  trackingNumber: string;
  address: string;
  lat: number;
  lng: number;
  status: OrderStatus;
  driverName: string;
  vehiclePlate: string;
  date: string;
  taskCount: number;
  isExclusive?: boolean;
}

@Component({
  selector: 'app-orders-map-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './orders-map-view.component.html',
  styleUrl: './orders-map-view.component.css'
})
export class OrdersMapViewComponent implements AfterViewInit {
  @ViewChild('mapContainer') mapContainerRef!: ElementRef<HTMLDivElement>;

  searchText = signal('');
  selectedOrderId = signal<string | null>(null);

  /** Datos hardcodeados de órdenes con ubicación de entrega */
  orders = signal<OrderWithLocation[]>([
    {
      id: '1',
      routeId: '8E01A55F0CDB87FAL',
      trackingNumber: 'GUIA-001',
      address: 'Av. Javier Prado 1234, San Isidro',
      lat: -12.0875,
      lng: -77.0502,
      status: 'in_progress',
      driverName: 'Juan Pérez',
      vehiclePlate: 'ABC 123',
      date: '01/07/2025',
      taskCount: 5,
      isExclusive: true
    },
    {
      id: '2',
      routeId: '8E01A55F0CDBB7FAL',
      trackingNumber: 'GUIA-002',
      address: 'Av. Brasil 2345, Lima',
      lat: -12.0625,
      lng: -77.0378,
      status: 'pending',
      driverName: 'María García',
      vehiclePlate: 'XYZ 456',
      date: '01/07/2025',
      taskCount: 3
    },
    {
      id: '3',
      routeId: '7D02B66G1DEC98GBM',
      trackingNumber: 'GUIA-003',
      address: 'Calle Los Olivos 456, Los Olivos',
      lat: -11.9822,
      lng: -77.0712,
      status: 'delivered',
      driverName: 'Carlos López',
      vehiclePlate: 'MIN 789',
      date: '30/06/2025',
      taskCount: 8
    },
    {
      id: '4',
      routeId: '9F03C77H2EFD09HCN',
      trackingNumber: 'GUIA-004',
      address: 'Av. La Marina 789, San Miguel',
      lat: -12.0789,
      lng: -77.0812,
      status: 'alert',
      driverName: 'Ernesto Pérez',
      vehiclePlate: 'Miniturbo',
      date: '01/07/2025',
      taskCount: 12,
      isExclusive: true
    },
    {
      id: '5',
      routeId: '1A04D88I3FGE10IDO',
      trackingNumber: 'GUIA-005',
      address: 'Jr. de la Unión 321, Cercado',
      lat: -12.0464,
      lng: -77.0428,
      status: 'in_progress',
      driverName: 'Ana Martínez',
      vehiclePlate: 'DEF 101',
      date: '01/07/2025',
      taskCount: 2
    }
  ]);

  private mapInstance: LeafletMap | null = null;
  private markers: LeafletMarker[] = [];
  /** Leaflet (default export); tipado flexible por incompatibilidad con @types/leaflet */
  private leafletLib: unknown = null;

  getStatusLabel(status: OrderStatus): string {
    const labels: Record<OrderStatus, string> = {
      pending: 'Pendiente',
      in_progress: 'En progreso',
      delivered: 'Finalizado',
      alert: 'En alerta'
    };
    return labels[status] ?? status;
  }

  getStatusClass(status: OrderStatus): string {
    return `orders-status--${status}`;
  }

  getFilteredOrders(): OrderWithLocation[] {
    const q = this.searchText().toLowerCase().trim();
    if (!q) return this.orders();
    return this.orders().filter(
      o =>
        o.routeId.toLowerCase().includes(q) ||
        o.trackingNumber.toLowerCase().includes(q) ||
        o.address.toLowerCase().includes(q) ||
        o.driverName.toLowerCase().includes(q)
    );
  }

  selectOrder(order: OrderWithLocation): void {
    this.selectedOrderId.set(order.id);
    this.flyToOrder(order);
  }

  clearSelection(): void {
    this.selectedOrderId.set(null);
  }

  private flyToOrder(order: OrderWithLocation): void {
    if (!this.mapInstance) return;
    this.mapInstance.flyTo([order.lat, order.lng], 15, { duration: 0.5 });
  }

  ngAfterViewInit(): void {
    if (typeof window === 'undefined') return;
    setTimeout(() => this.initMap(), 150);
  }

  private async initMap(): Promise<void> {
    try {
      const leafletModule = await import('leaflet');
      const L = leafletModule.default as {
        map: (el: HTMLElement, opts: object) => LeafletMap;
        tileLayer: (url: string, opts: object) => { addTo: (m: LeafletMap) => unknown };
        divIcon: (opts: object) => unknown;
        marker: (latlng: [number, number], opts: object) => LeafletMarker;
        Icon?: { Default?: { prototype: { _getIconUrl?: unknown }; mergeOptions: (o: object) => void } };
      };
      this.leafletLib = L;
      this.fixLeafletIcon(L);

      const el = this.mapContainerRef?.nativeElement;
      if (!el) return;

      const center: [number, number] = [-12.0464, -77.0428];
      const map = L.map(el, { center, zoom: 12 });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map);

      this.mapInstance = map;
      this.addMarkers(map);
      setTimeout(() => map.invalidateSize(), 200);
    } catch (err) {
      console.warn('Leaflet no cargado:', err);
    }
  }

  private fixLeafletIcon(L: unknown): void {
    const Lib = L as { Icon?: { Default?: { prototype: { _getIconUrl?: unknown }; mergeOptions: (o: object) => void } } };
    const DefaultIcon = Lib.Icon?.Default;
    if (DefaultIcon?.prototype && '_getIconUrl' in DefaultIcon.prototype) {
      delete (DefaultIcon.prototype as { _getIconUrl?: unknown })._getIconUrl;
    }
    if (DefaultIcon?.mergeOptions) {
      DefaultIcon.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
      });
    }
  }

  private addMarkers(map: LeafletMap): void {
    const L = this.leafletLib as {
      divIcon: (opts: object) => unknown;
      marker: (latlng: [number, number], opts: object) => LeafletMarker;
    };
    if (!L?.divIcon || !L?.marker) return;
    this.markers = [];

    for (const order of this.orders()) {
      const isAlert = order.status === 'alert';
      const isInProgress = order.status === 'in_progress';
      const color = isAlert ? '#dc2626' : isInProgress ? '#2563eb' : '#059669';
      const iconName = isInProgress ? 'local_shipping' : 'inventory_2';

      const icon = L.divIcon({
        className: 'orders-marker',
        html: `
          <div class="orders-marker-circle" style="background-color:${color}">
            <span class="material-symbols-outlined orders-marker-icon">${iconName}</span>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 40]
      });

      const marker = L.marker([order.lat, order.lng], { icon })
        .addTo(map)
        .on('click', () => this.selectOrder(order));

      (marker as unknown as { _orderId: string })._orderId = order.id;
      this.markers.push(marker);
    }
  }
}
