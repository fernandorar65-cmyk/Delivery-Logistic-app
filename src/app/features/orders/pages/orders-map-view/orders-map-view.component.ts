import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, signal, ViewChild } from '@angular/core';
import type { Map as LeafletMap, Marker as LeafletMarker } from 'leaflet';

export type OrderStatus = 'pending' | 'in_progress' | 'delivered' | 'alert';

/** Respuesta de un solver VRP (Vehicle Routing Problem): rutas por vehículo y jobs no asignados */
export interface VRPResponse {
  code: number;
  summary: {
    cost: number;
    routes: number;
    unassigned: number;
    delivery: number[];
    amount: number[];
    pickup: number[];
    setup: number;
    service: number;
    duration: number;
    waiting_time: number;
    priority: number;
    violations: unknown[];
    computing_times?: { loading: number; solving: number; routing: number };
  };
  unassigned: Array<{ id: number; location: [number, number]; type: string }>;
  routes: VRPRoute[];
}

/** Una ruta asignada a un vehículo */
export interface VRPRoute {
  vehicle: number;
  cost: number;
  delivery: number[];
  amount: number[];
  pickup: number[];
  setup: number;
  service: number;
  duration: number;
  waiting_time: number;
  priority: number;
  steps: VRPStep[];
  violations: unknown[];
}

/** Paso de una ruta: start (depósito), job (entrega), end (vuelta) */
export interface VRPStep {
  type: 'start' | 'job' | 'end';
  location: [number, number]; // [lng, lat]
  id?: number;
  job?: number;
  setup?: number;
  service?: number;
  waiting_time?: number;
  load?: number[];
  arrival?: number;
  duration?: number;
  violations?: unknown[];
}

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
  /** Puntos intermedios [lat, lng] por los que pasa la ruta (waypoints OSRM). */
  waypoints?: [number, number][];
  /** true = job no asignado (solo un punto en el mapa) */
  isUnassigned?: boolean;
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

/** Ejemplo de respuesta VRP. location en JSON es [lng, lat]. */
const VRP_SAMPLE: VRPResponse = {
  code: 0,
  summary: {
    cost: 20946,
    routes: 2,
    unassigned: 1,
    delivery: [5],
    amount: [5],
    pickup: [0],
    setup: 0,
    service: 1500,
    duration: 20946,
    waiting_time: 0,
    priority: 0,
    violations: [],
    computing_times: { loading: 443, solving: 0, routing: 0 }
  },
  unassigned: [{ id: 4, location: [2.41808, 49.22619], type: 'job' }],
  routes: [
    {
      vehicle: 1,
      cost: 8662,
      delivery: [3],
      amount: [3],
      pickup: [0],
      setup: 0,
      service: 900,
      duration: 8662,
      waiting_time: 0,
      priority: 0,
      steps: [
        { type: 'start', location: [2.35044, 48.51764], setup: 0, service: 0, waiting_time: 0, load: [3], arrival: 28800, duration: 0, violations: [] },
        { type: 'job', location: [2.28325, 48.5958], id: 5, setup: 0, service: 300, waiting_time: 0, job: 5, load: [2], arrival: 30352, duration: 1552, violations: [] },
        { type: 'job', location: [1.98465, 48.70329], id: 1, setup: 0, service: 300, waiting_time: 0, job: 1, load: [1], arrival: 33447, duration: 4347, violations: [] },
        { type: 'job', location: [2.03655, 48.61128], id: 2, setup: 0, service: 300, waiting_time: 0, job: 2, load: [0], arrival: 35033, duration: 5633, violations: [] },
        { type: 'end', location: [2.35044, 48.51764], setup: 0, service: 0, waiting_time: 0, load: [0], arrival: 38362, duration: 8662, violations: [] }
      ],
      violations: []
    },
    {
      vehicle: 2,
      cost: 12284,
      delivery: [2],
      amount: [2],
      pickup: [0],
      setup: 0,
      service: 600,
      duration: 12284,
      waiting_time: 0,
      priority: 0,
      steps: [
        { type: 'start', location: [2.35044, 48.51764], setup: 0, service: 0, waiting_time: 0, load: [2], arrival: 28800, duration: 0, violations: [] },
        { type: 'job', location: [2.89357, 48.90736], id: 6, setup: 0, service: 300, waiting_time: 0, job: 6, load: [1], arrival: 33003, duration: 4203, violations: [] },
        { type: 'job', location: [2.39719, 49.07611], id: 3, setup: 0, service: 300, waiting_time: 0, job: 3, load: [0], arrival: 36116, duration: 7016, violations: [] },
        { type: 'end', location: [2.35044, 48.51764], setup: 0, service: 0, waiting_time: 0, load: [0], arrival: 41684, duration: 12284, violations: [] }
      ],
      violations: []
    }
  ]
};

/** Convierte la respuesta VRP en órdenes para el mapa. Cada ruta = una orden (inicio → paradas → destino). */
function vrpResponseToOrders(response: VRPResponse): OrderWithLocation[] {
  const orders: OrderWithLocation[] = [];
  const today = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });

  for (const route of response.routes) {
    const startStep = route.steps.find(s => s.type === 'start');
    const jobSteps = route.steps.filter((s): s is VRPStep & { type: 'job' } => s.type === 'job');
    if (!startStep || jobSteps.length === 0) continue;

    const [pickupLng, pickupLat] = startStep.location;
    const lastJob = jobSteps[jobSteps.length - 1];
    const [destLng, destLat] = lastJob.location;
    const waypoints: [number, number][] = jobSteps.slice(0, -1).map(s => [s.location[1], s.location[0]]);

    orders.push({
      id: `route-${route.vehicle}`,
      routeId: `VRP-R${route.vehicle}`,
      trackingNumber: `Ruta ${route.vehicle}`,
      address: `Última entrega (Job ${lastJob.job ?? lastJob.id})`,
      lat: destLat,
      lng: destLng,
      pickupLat,
      pickupLng,
      pickupAddress: 'Depósito',
      status: 'in_progress',
      driverName: `Vehículo ${route.vehicle}`,
      vehiclePlate: `V-${route.vehicle}`,
      date: today,
      taskCount: jobSteps.length,
      waypoints: waypoints.length > 0 ? waypoints : undefined
    });
  }

  for (const u of response.unassigned) {
    const [lng, lat] = u.location;
    orders.push({
      id: `unassigned-${u.id}`,
      routeId: `NA-${u.id}`,
      trackingNumber: `Job ${u.id} (no asignado)`,
      address: `Job ${u.id} – Sin ruta`,
      lat,
      lng,
      pickupLat: lat,
      pickupLng: lng,
      pickupAddress: 'N/A',
      status: 'alert',
      driverName: '—',
      vehiclePlate: '—',
      date: today,
      taskCount: 0,
      isUnassigned: true
    });
  }

  return orders;
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

  /** Órdenes/rutas a partir del JSON VRP */
  orders = signal<OrderWithLocation[]>(vrpResponseToOrders(VRP_SAMPLE));

  private mapInstance: LeafletMap | null = null;
  private markers: LeafletMarker[] = [];
  /** Marcadores de waypoints (paradas) por orden */
  private waypointMarkers: LeafletMarker[][] = [];
  /** Polylines de rutas (no se añaden al mapa hasta que se selecciona una orden) */
  private polylinesTrack: RoutePolyline[] = [];
  private polylinesDash: RoutePolyline[] = [];
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
    return this.fetchRouteOSRMWithWaypoints([
      [pickupLat, pickupLng],
      [destLat, destLng]
    ]);
  }

  /** Ruta por carretera pasando por varios waypoints en orden (A → B → C → …). OSRM + inserción de waypoints en la geometría. */
  private async fetchRouteOSRMWithWaypoints(points: [number, number][]): Promise<[number, number][]> {
    if (points.length < 2) return [];
    const coords = points.map(([lat, lng]) => `${lng},${lat}`).join(';');
    const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;
    try {
      const res = await fetch(url);
      if (!res.ok) return [];
      const data = await res.json();
      const coordsGeo = data?.routes?.[0]?.geometry?.coordinates as [number, number][] | undefined;
      if (!coordsGeo?.length) return [];
      let path = coordsGeo.map(([lng, lat]: [number, number]) => [lat, lng] as [number, number]);
      if (points.length > 2) {
        const waypoints = points.slice(1, -1);
        path = this.insertWaypointsIntoPath(path, waypoints);
      }
      return path;
    } catch {
      return [];
    }
  }

  private insertWaypointsIntoPath(path: [number, number][], waypoints: [number, number][]): [number, number][] {
    if (waypoints.length === 0) return path;
    let result = [...path];
    let searchStart = 0;
    for (const wp of waypoints) {
      let bestIdx = searchStart;
      let bestDistSq = Infinity;
      for (let i = searchStart; i < result.length - 1; i++) {
        const dSq = this.distSqToSegment(wp, result[i], result[i + 1]);
        if (dSq < bestDistSq) {
          bestDistSq = dSq;
          bestIdx = i;
        }
      }
      result = [...result.slice(0, bestIdx + 1), wp, ...result.slice(bestIdx + 1)];
      searchStart = bestIdx + 1;
    }
    return result;
  }

  private distSqToSegment(p: [number, number], a: [number, number], b: [number, number]): number {
    const [px, py] = p;
    const [ax, ay] = a;
    const [bx, by] = b;
    const dx = bx - ax;
    const dy = by - ay;
    const t = dx !== 0 || dy !== 0
      ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)))
      : 0;
    const qx = ax + t * dx;
    const qy = ay + t * dy;
    return (px - qx) ** 2 + (py - qy) ** 2;
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
    this.updateTooltipsVisibility();
  }

  /** Quita todas las polylines del mapa. */
  private removeAllPolylinesFromMap(): void {
    this.polylinesOnMap.forEach(p => p.remove());
    this.polylinesOnMap = [];
  }

  /** Actualiza qué rutas se muestran en el mapa y centra la vista en ellas. */
  private updateMapPolylinesAndView(): void {
    this.removeAllPolylinesFromMap();
    this.updateTooltipsVisibility();
    if (!this.mapInstance) return;

    const ids = this.selectedOrderIds();
    if (ids.size === 0) return;

    const orders = this.orders();
    const bounds: [number, number][] = [];

    for (let i = 0; i < orders.length; i++) {
      if (!ids.has(orders[i].id)) continue;
      const polyTrack = this.polylinesTrack[i];
      const polyDash = this.polylinesDash[i];
      if (polyTrack) {
        polyTrack.addTo(this.mapInstance);
        this.polylinesOnMap.push(polyTrack);
      }
      if (polyDash) {
        polyDash.addTo(this.mapInstance);
        this.polylinesOnMap.push(polyDash);
      }
      if (polyTrack) {
        try {
          const b = polyTrack.getBounds();
          bounds.push([b.getSouth(), b.getWest()], [b.getNorth(), b.getEast()]);
        } catch {
          bounds.push([orders[i].pickupLat, orders[i].pickupLng], [orders[i].lat, orders[i].lng]);
        }
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

  /** Muestra las tarjetas de detalle solo en los marcadores de las órdenes seleccionadas; oculta el resto. */
  private updateTooltipsVisibility(): void {
    const ids = this.selectedOrderIds();
    const orders = this.orders();
    for (let i = 0; i < orders.length; i++) {
      const startMarker = this.markers[i * 2] as LeafletMarker & { openTooltip?: () => void; closeTooltip?: () => void };
      const destMarker = this.markers[i * 2 + 1] as LeafletMarker & { openTooltip?: () => void; closeTooltip?: () => void };
      const selected = ids.has(orders[i].id);
      if (startMarker?.openTooltip && startMarker?.closeTooltip) {
        selected ? startMarker.openTooltip() : startMarker.closeTooltip();
      }
      if (destMarker?.openTooltip && destMarker?.closeTooltip) {
        selected ? destMarker.openTooltip() : destMarker.closeTooltip();
      }
      const wpMarkers = this.waypointMarkers[i] ?? [];
      wpMarkers.forEach(m => {
        const layer = m as unknown as { _map?: unknown };
        if (selected) {
          if (this.mapInstance && !layer._map) m.addTo(this.mapInstance);
        } else {
          m.remove();
        }
      });
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

      const center: [number, number] = [48.75, 2.35];
      const map = L.map(el, { center, zoom: 9 });

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
      this.updateTooltipsVisibility();
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
      marker: (latlng: [number, number], opts: object) => LeafletMarker & { bindTooltip: (content: string, opts?: object) => void; addTo: (m: LeafletMap) => LeafletMarker; remove: () => void };
      polyline: (latlngs: [number, number][], opts?: object) => { addTo: (m: LeafletMap) => unknown };
    };
    if (!L?.divIcon || !L?.marker) return;
    this.markers = [];
    this.waypointMarkers = [];
    this.polylinesTrack = [];
    this.polylinesDash = [];

    const ordersList = this.orders();
    for (let orderIndex = 0; orderIndex < ordersList.length; orderIndex++) {
      const order = ordersList[orderIndex];
      const isAlert = order.status === 'alert';
      const isInProgress = order.status === 'in_progress';
      const color = isAlert ? '#dc2626' : isInProgress ? '#2563eb' : '#059669';
      const iconName = isInProgress ? 'local_shipping' : 'inventory_2';
      const statusText = isInProgress ? 'En movimiento' : this.getStatusLabel(order.status);

      const latlngs: [number, number][] = [
        [order.pickupLat, order.pickupLng],
        [order.lat, order.lng]
      ];

      const routeTrack = L.polyline(latlngs, {
        color,
        weight: 10,
        opacity: 0.35,
        lineCap: 'round',
        lineJoin: 'round'
      }) as unknown as RoutePolyline;
      this.polylinesTrack.push(routeTrack);

      const routeDash = L.polyline(latlngs, {
        color,
        weight: 4,
        opacity: 1,
        dashArray: '8, 12',
        lineCap: 'round',
        lineJoin: 'round',
        className: 'orders-route-line-animated'
      }) as unknown as RoutePolyline;
      this.polylinesDash.push(routeDash);

      const ubicacionCard = `
        <div class="orders-map-infocard orders-map-infocard--ubicacion">
          <div class="orders-map-infocard-badge orders-map-infocard-badge--green">
            <span class="material-symbols-outlined">local_shipping</span>
          </div>
          <div class="orders-map-infocard-body">
            <p class="orders-map-infocard-caption">UBICACIÓN ACTUAL</p>
            <p class="orders-map-infocard-title">${this.escapeHtml(order.driverName)} (${this.escapeHtml(order.vehiclePlate)})</p>
            <p class="orders-map-infocard-status">${this.escapeHtml(statusText)}</p>
          </div>
        </div>
        <div class="orders-map-infocard-arrow orders-map-infocard-arrow--top"></div>
      `;

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
      startMarker.bindTooltip(ubicacionCard, {
        permanent: false,
        direction: 'bottom',
        offset: [0, 32],
        className: 'orders-map-tooltip orders-map-tooltip--ubicacion',
        opacity: 1
      });
      this.markers.push(startMarker);

      this.waypointMarkers[orderIndex] = [];
      (order.waypoints ?? []).forEach((wp, wpIndex) => {
        const stopIcon = L.divIcon({
          className: 'orders-marker orders-marker--waypoint',
          html: `
            <div class="orders-marker-circle orders-marker-circle--stop" style="background-color:#f59e0b; border-color:#d97706">
              <span class="material-symbols-outlined orders-marker-icon">stop_circle</span>
            </div>
            <span class="orders-marker-label">Parada ${wpIndex + 1}</span>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 40]
        });
        const wpMarker = L.marker([wp[0], wp[1]], { icon: stopIcon });
        wpMarker.bindTooltip(`Parada ${wpIndex + 1} – Punto intermedio`, {
          permanent: false,
          direction: 'top',
          offset: [0, -24],
          className: 'orders-map-tooltip orders-map-tooltip--waypoint',
          opacity: 1
        });
        wpMarker.on('click', () => this.selectOrder(order));
        this.waypointMarkers[orderIndex].push(wpMarker);
      });

      const destinoCard = `
        <div class="orders-map-infocard-arrow orders-map-infocard-arrow--top"></div>
        <div class="orders-map-infocard orders-map-infocard--destino">
          <div class="orders-map-infocard-badge orders-map-infocard-badge--rose">
            <span class="material-symbols-outlined">location_on</span>
          </div>
          <div class="orders-map-infocard-body">
            <p class="orders-map-infocard-caption">DESTINO</p>
            <p class="orders-map-infocard-title">${this.escapeHtml(order.address)}</p>
          </div>
        </div>
      `;

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
      marker.bindTooltip(destinoCard, {
        permanent: false,
        direction: 'bottom',
        offset: [0, 32],
        className: 'orders-map-tooltip orders-map-tooltip--destino',
        opacity: 1
      });

      (marker as unknown as { _orderId: string })._orderId = order.id;
      this.markers.push(marker);
    }
  }

  private escapeHtml(text: string): string {
    const div = typeof document !== 'undefined' ? document.createElement('div') : null;
    if (!div) return text;
    div.textContent = text;
    return div.innerHTML;
  }

  /** Pide a OSRM la ruta por carretera para cada orden y actualiza las polylines cuando responden. */
  private loadRoutesAndUpdatePolylines(map: LeafletMap): void {
    const list = this.orders();
    list.forEach((order, index) => {
      if (order.isUnassigned) {
        const pt: [number, number] = [order.lat, order.lng];
        if (this.polylinesTrack[index]) this.polylinesTrack[index].setLatLngs([pt, pt]);
        if (this.polylinesDash[index]) this.polylinesDash[index].setLatLngs([pt, pt]);
        return;
      }
      const points: [number, number][] =
        order.waypoints?.length
          ? [[order.pickupLat, order.pickupLng], ...order.waypoints, [order.lat, order.lng]]
          : [[order.pickupLat, order.pickupLng], [order.lat, order.lng]];

      this.fetchRouteOSRMWithWaypoints(points).then(coords => {
        if (coords.length > 0) {
          if (this.polylinesTrack[index]) this.polylinesTrack[index].setLatLngs(coords);
          if (this.polylinesDash[index]) this.polylinesDash[index].setLatLngs(coords);
        }
      });
    });
  }
}
