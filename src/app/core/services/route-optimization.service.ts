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

  private get baseUrl(): string {
    const env = environment as { apiUrl: string; optimizeRoutesUrl?: string };
    const url = env.optimizeRoutesUrl?.trim();
    return url ? url.replace(/\/?$/, '') : `${env.apiUrl.replace(/\/?$/, '')}/optimize-routes`;
  }

  /**
   * Optimiza rutas enviando órdenes y vehículos al backend.
   * POST body: { orders: [{ id, lat, lon }, ...], vehicles: [{ id, start_lat, start_lon }, ...] }
   * @returns Observable con { routes, unassigned }
   */
  optimizeRoutes(payload: OptimizeRoutesRequest): Observable<OptimizeRoutesResponse> {
    return this.http.post<OptimizeRoutesResponse>(`${this.baseUrl}/`, payload);
  }
}
