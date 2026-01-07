import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../../services/order.service';
import { Order } from '../../../models/order.model';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.css'
})
export class OrderListComponent {
  private orderService = inject(OrderService);
  
  orders = signal<Order[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor() {
    this.loadOrders();
  }

  loadOrders(page: number = 1) {
    this.loading.set(true);
    this.error.set(null);
    
    this.orderService.getAll(page).subscribe({
      next: (response) => {
        this.orders.set(response.results);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar las órdenes. Por favor, intente nuevamente.');
        this.loading.set(false);
        console.error('Error loading orders:', err);
      }
    });
  }
}

