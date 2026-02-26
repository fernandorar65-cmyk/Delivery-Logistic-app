import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, signal, ViewChild } from '@angular/core';
import type { Map as LeafletMap, Marker as LeafletMarker } from 'leaflet';

export type OrderStatus = 'pending' | 'in_progress' | 'delivered' | 'alert';

export interface OrderWithLocation {
  id: string;
  routeId: string;
  trackingNumber: string;
  address: string;
  /** Coordenadas de entrega (destino / llegada) */
  lat: number;
  lng: number;
  /** Coordenadas de recojo (origen / punto de inicio de la ruta) */
  pickupLat: number;
  pickupLng: number;
  pickupAddress?: string;
  status: OrderStatus;
  driverName: string;
  vehiclePlate: string;
  date: string;
  taskCount: number;
  isExclusive?: boolean;
}

/** Polyline de Leaflet con métodos que usamos para mostrar/ocultar y encuadrar */
type RoutePolyline = {
  addTo: (m: LeafletMap) => unknown;
  remove: () => void;
  setLatLngs: (latlngs: [number, number][]) => void;
  getBounds: () => { getNorth: () => number; getSouth: () => number; getWest: () => number; getEast: () => number };
};

/** Tile layer de Leaflet con addTo y remove */
type TileLayerRef = { addTo: (m: LeafletMap) => unknown; remove: () => void };

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
  /** Filtro por estado: 'all' | 'in_progress' | 'alert' | 'pending' | 'delivered' */
  statusFilter = signal<OrderStatus | 'all'>('all');
  /** IDs de órdenes seleccionadas (se puede elegir más de una) */
  selectedOrderIds = signal<Set<string>>(new Set());

  /** Tipo de mapa: 'map' (callejero) o 'satellite' */
  mapType = signal<'map' | 'satellite'>('map');

  setMapType(type: 'map' | 'satellite'): void {
    if (this.mapType() === type) return;
    this.mapType.set(type);
    this.switchBaseLayer(type);
  }

  /** Indica si una orden está seleccionada (para marcar la tarjeta y el checkbox) */
  isOrderSelected(orderId: string): boolean {
    return this.selectedOrderIds().has(orderId);
  }

  setStatusFilter(status: OrderStatus | 'all'): void {
    this.statusFilter.set(status);
  }

  getCountByStatus(status: OrderStatus | 'all'): number {
    if (status === 'all') return this.orders().length;
    return this.orders().filter(o => o.status === status).length;
  }

  /** Datos hardcodeados de órdenes con ubicación de recojo y entrega */
  orders = signal<OrderWithLocation[]>([
    {
      id: '1',
      routeId: '8E01A55F0CDB87FAL',
      trackingNumber: 'GUIA-001',
      address: 'Av. Javier Prado 1234, San Isidro',
      lat: -12.0875,
      lng: -77.0502,
      pickupLat: -12.0760,
      pickupLng: -77.0422,
      pickupAddress: 'Almacén Central, Miraflores',
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
      pickupLat: -12.0464,
      pickupLng: -77.0428,
      pickupAddress: 'Centro de distribución, Cercado',
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
      pickupLat: -12.0200,
      pickupLng: -77.0500,
      pickupAddress: 'Depósito Norte, Independencia',
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
      pickupLat: -12.0650,
      pickupLng: -77.0650,
      pickupAddress: 'Base San Isidro',
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
      pickupLat: -12.0550,
      pickupLng: -77.0300,
      pickupAddress: 'Punto de recojo, Lince',
      status: 'in_progress',
      driverName: 'Ana Martínez',
      vehiclePlate: 'DEF 101',
      date: '01/07/2025',
      taskCount: 2
    }
  ]);

  private mapInstance: LeafletMap | null = null;
  private markers: LeafletMarker[] = [];
  /** Polylines de rutas (no se añaden al mapa hasta que se selecciona una orden) */
  private polylines: RoutePolyline[] = [];
  /** Polylines actualmente visibles en el mapa (varias si hay selección múltiple) */
  private polylinesOnMap: RoutePolyline[] = [];
  /** Capas base del mapa (callejero y satélite) para alternar */
  private osmLayer: TileLayerRef | null = null;
  private satelliteLayer: TileLayerRef | null = null;
  private currentBaseLayer: TileLayerRef | null = null;
  /** Leaflet (default export); tipado flexible por incompatibilidad con @types/leaflet */
  private leafletLib: unknown = null;

  /** Obtiene la ruta por carretera entre dos puntos usando OSRM (gratuito, sin API key). */
  private async fetchRouteOSRM(
    pickupLat: number,
    pickupLng: number,
    destLat: number,
    destLng: number
  ): Promise<[number, number][]> {
    const coords = `${pickupLng},${pickupLat};${destLng},${destLat}`;
    const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;
    try {
      const res = await fetch(url);
      if (!res.ok) return [];
      const data = await res.json();
      const coordsGeo = data?.routes?.[0]?.geometry?.coordinates as [number, number][] | undefined;
      if (!coordsGeo?.length) return [];
      // GeoJSON es [lng, lat]; Leaflet usa [lat, lng]
      return coordsGeo.map(([lng, lat]: [number, number]) => [lat, lng]);
    } catch {
      return [];
    }
  }

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
    const status = this.statusFilter();
    let list = this.orders();
    if (status !== 'all') list = list.filter(o => o.status === status);
    if (!q) return list;
    return list.filter(
      o =>
        o.routeId.toLowerCase().includes(q) ||
        o.trackingNumber.toLowerCase().includes(q) ||
        o.address.toLowerCase().includes(q) ||
        o.driverName.toLowerCase().includes(q)
    );
  }

  selectOrder(order: OrderWithLocation): void {
    this.toggleOrderSelection(order);
  }

  /** Conmuta la selección de una orden (permite selección múltiple). */
  toggleOrderSelection(order: OrderWithLocation): void {
    const current = this.selectedOrderIds();
    const next = new Set(current);
    if (next.has(order.id)) next.delete(order.id);
    else next.add(order.id);
    this.selectedOrderIds.set(next);
    this.updateMapPolylinesAndView();
  }

  /** Selecciona todas las órdenes visibles (filtradas). */
  selectAllOrders(): void {
    const ids = this.getFilteredOrders().map(o => o.id);
    this.selectedOrderIds.set(new Set(ids));
    this.updateMapPolylinesAndView();
  }

  clearSelection(): void {
    this.selectedOrderIds.set(new Set());
    this.removeAllPolylinesFromMap();
  }

  /** Quita todas las polylines del mapa. */
  private removeAllPolylinesFromMap(): void {
    this.polylinesOnMap.forEach(p => p.remove());
    this.polylinesOnMap = [];
  }

  /** Actualiza qué rutas se muestran en el mapa y centra la vista en ellas. */
  private updateMapPolylinesAndView(): void {
    this.removeAllPolylinesFromMap();
    if (!this.mapInstance) return;

    const ids = this.selectedOrderIds();
    if (ids.size === 0) return;

    const orders = this.orders();
    const bounds: [number, number][] = [];

    for (let i = 0; i < orders.length; i++) {
      if (!ids.has(orders[i].id)) continue;
      const poly = this.polylines[i];
      if (!poly) continue;
      poly.addTo(this.mapInstance);
      this.polylinesOnMap.push(poly);
      try {
        const b = poly.getBounds();
        bounds.push([b.getSouth(), b.getWest()], [b.getNorth(), b.getEast()]);
      } catch {
        bounds.push([orders[i].pickupLat, orders[i].pickupLng], [orders[i].lat, orders[i].lng]);
      }
    }

    if (bounds.length > 0) {
      const south = Math.min(...bounds.map(p => p[0]));
      const north = Math.max(...bounds.map(p => p[0]));
      const west = Math.min(...bounds.map(p => p[1]));
      const east = Math.max(...bounds.map(p => p[1]));
      this.mapInstance.flyToBounds(
        [[south, west], [north, east]] as [number, number][],
        { padding: [60, 60], maxZoom: 14, duration: 0.6 }
      );
    }
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
        tileLayer: (url: string, opts: object) => TileLayerRef;
        divIcon: (opts: object) => unknown;
        marker: (latlng: [number, number], opts: object) => LeafletMarker;
        polyline: (latlngs: [number, number][], opts?: object) => { addTo: (m: LeafletMap) => unknown };
        Icon?: { Default?: { prototype: { _getIconUrl?: unknown }; mergeOptions: (o: object) => void } };
      };
      this.leafletLib = L;
      this.fixLeafletIcon(L);

      const el = this.mapContainerRef?.nativeElement;
      if (!el) return;

      const center: [number, number] = [-12.0464, -77.0428];
      const map = L.map(el, { center, zoom: 12 });

      const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      });
      const satellite = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: '&copy; <a href="https://www.esri.com/">Esri</a>',
          maxZoom: 19
        }
      );

      this.osmLayer = osm;
      this.satelliteLayer = satellite;
      this.currentBaseLayer = osm;
      osm.addTo(map);

      this.mapInstance = map;
      this.addMarkers(map);
      this.loadRoutesAndUpdatePolylines(map);
      setTimeout(() => map.invalidateSize(), 200);
    } catch (err) {
      console.warn('Leaflet no cargado:', err);
    }
  }

  /** Cambia la capa base entre callejero y satélite. */
  private switchBaseLayer(type: 'map' | 'satellite'): void {
    if (!this.mapInstance) return;
    const layer = type === 'satellite' ? this.satelliteLayer : this.osmLayer;
    if (!layer) return;
    if (this.currentBaseLayer) this.currentBaseLayer.remove();
    layer.addTo(this.mapInstance);
    this.currentBaseLayer = layer;
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
      polyline: (latlngs: [number, number][], opts?: object) => { addTo: (m: LeafletMap) => unknown };
    };
    if (!L?.divIcon || !L?.marker) return;
    this.markers = [];
    this.polylines = [];

    for (const order of this.orders()) {
      const isAlert = order.status === 'alert';
      const isInProgress = order.status === 'in_progress';
      const color = isAlert ? '#dc2626' : isInProgress ? '#2563eb' : '#059669';
      const iconName = isInProgress ? 'local_shipping' : 'inventory_2';

      // Línea de ruta: se crea pero NO se añade al mapa; solo se muestra al seleccionar la orden
      const routeLine = L.polyline(
        [
          [order.pickupLat, order.pickupLng],
          [order.lat, order.lng]
        ],
        {
          color,
          weight: 8,
          opacity: 0.92,
          dashArray: isInProgress ? undefined : '10, 10'
        }
      ) as unknown as RoutePolyline;
      this.polylines.push(routeLine);

      // Marcador de inicio (recojo) — icono de auto/camión
      const startIcon = L.divIcon({
        className: 'orders-marker orders-marker--start',
        html: `
          <div class="orders-marker-circle" style="background-color:#6366f1; border-color:#4f46e5">
            <span class="material-symbols-outlined orders-marker-icon">flag</span>
          </div>
          <span class="orders-marker-label">Inicio</span>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 44]
      });
      const startMarker = L.marker([order.pickupLat, order.pickupLng], { icon: startIcon })
        .addTo(map)
        .on('click', () => this.selectOrder(order));
      this.markers.push(startMarker);

      // Marcador de llegada (entrega) — paquete o camión según estado
      const icon = L.divIcon({
        className: 'orders-marker',
        html: `
          <div class="orders-marker-circle" style="background-color:${color}">
            <span class="material-symbols-outlined orders-marker-icon">${iconName}</span>
          </div>
          <span class="orders-marker-label">Llegada</span>
        `,
        iconSize: [48, 48],
        iconAnchor: [24, 48]
      });

      const marker = L.marker([order.lat, order.lng], { icon })
        .addTo(map)
        .on('click', () => this.selectOrder(order));

      (marker as unknown as { _orderId: string })._orderId = order.id;
      this.markers.push(marker);
    }
  }

  /** Pide a OSRM la ruta por carretera para cada orden y actualiza las polylines cuando responden. */
  private loadRoutesAndUpdatePolylines(map: LeafletMap): void {
    const list = this.orders();
    list.forEach((order, index) => {
      this.fetchRouteOSRM(order.pickupLat, order.pickupLng, order.lat, order.lng).then(coords => {
        if (coords.length > 0 && this.polylines[index]) {
          this.polylines[index].setLatLngs(coords);
        }
      });
    });
  }
}
