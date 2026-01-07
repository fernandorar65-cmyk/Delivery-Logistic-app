import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order, OrderCreate, OrderUpdate } from '../models/order.model';
import { PaginatedResponse } from '../models/paginated-response.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/orders`;

  getAll(page: number = 1): Observable<PaginatedResponse<Order>> {
    const params = new HttpParams().set('page', page.toString());
    return this.http.get<PaginatedResponse<Order>>(`${this.apiUrl}/`, { params });
  }

  getById(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}/`);
  }

  create(order: OrderCreate): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/`, order);
  }

  update(id: string, order: OrderUpdate): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/${id}/`, order);
  }

  partialUpdate(id: string, order: OrderUpdate): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/${id}/`, order);
  }
}

