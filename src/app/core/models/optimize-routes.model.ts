/** Orden para optimización de rutas (request). */
export interface OptimizeRouteOrder {
  id: number;
  lat: number;
  lon: number;
}

/** Vehículo para optimización de rutas (request). */
export interface OptimizeRouteVehicle {
  id: number;
  start_lat: number;
  start_lon: number;
}

/** Body del POST /optimize-routes/ */
export interface OptimizeRoutesRequest {
  orders: OptimizeRouteOrder[];
  vehicles: OptimizeRouteVehicle[];
}

/** Paso de una ruta (start, job, end). */
export interface OptimizeRouteStep {
  type: 'start' | 'job' | 'end';
  location: [number, number];
  id?: number;
  job?: number;
  setup?: number;
  service?: number;
  waiting_time?: number;
  arrival?: number;
  duration?: number;
  violations?: unknown[];
}

/** GeoJSON de una ruta (simplificado; el backend devuelve estructura openrouteservice). */
export interface OptimizeRouteGeojson {
  bbox?: number[];
  routes?: unknown[];
  metadata?: unknown;
}

/** Una ruta asignada a un vehículo (response). */
export interface OptimizeRouteResult {
  vehicle: number;
  geojson: OptimizeRouteGeojson;
  steps: OptimizeRouteStep[];
}

/** Response del POST /optimize-routes/ */
export interface OptimizeRoutesResponse {
  routes: OptimizeRouteResult[];
  unassigned: unknown[];
}
