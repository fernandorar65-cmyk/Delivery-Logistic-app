import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import type { ManualOrderCreatePayload, ManualOrderCreateResponse } from '@app/features/clients/models/manual-order.model';

/**
 * Servicio para el API de órdenes (creación manual).
 * POST /api/v1/orders/
 */
@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private http = inject(HttpClient);

  /**
   * Crea una orden manual (una sola orden).
   * POST /api/v1/orders/
   */
  createOrder(payload: ManualOrderCreatePayload): Observable<ManualOrderCreateResponse> {
    return this.http.post<ManualOrderCreateResponse>(`${environment.apiUrl}/orders/`, payload);
  }
}
