import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import type {
  OptimizeRoutesRequest,
  OptimizeRoutesResponse
} from '@app/core/models/optimize-routes.model';

@Injectable({
  providedIn: 'root'
})
export class RouteOptimizationService {
  private http = inject(HttpClient);

  /** URL base del servicio de optimización (variable de entorno propia; no usa token). */
  private get baseUrl(): string {
    const url = (environment as { routeOptimizationApiUrl?: string }).routeOptimizationApiUrl?.trim() ?? '';
    return url.replace(/\/?$/, '');
  }

  /**
   * Optimiza rutas enviando órdenes y vehículos al backend.
   * POST body: { orders: [{ id, lat, lon }, ...], vehicles: [{ id, start_lat, start_lon }, ...] }
   * No envía Authorization; este endpoint tiene URL y servicio propios.
   * @returns Observable con { routes, unassigned }
   */
  optimizeRoutes(payload: OptimizeRoutesRequest): Observable<OptimizeRoutesResponse> {
    if (!this.baseUrl) {
      throw new Error('routeOptimizationApiUrl no está configurada en environment.');
    }
    return this.http.post<OptimizeRoutesResponse>(`${this.baseUrl}/`, payload);
  }
}
