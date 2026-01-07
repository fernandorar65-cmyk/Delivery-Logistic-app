import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../../services/order.service';
import { Order } from '../../../models/order.model';

@Component({
  selector: 'app-order-list-view',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-list-view.component.html',
  styleUrl: './order-list-view.component.css'
})
export class OrderListViewComponent {
  private orderService = inject(OrderService);
  
  orders = signal<Order[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  currentPage = signal(1);
  totalCount = signal(0);
  hasNext = signal(false);
  hasPrevious = signal(false);

  constructor() {
    this.loadOrders(1);
  }

  loadOrders(page: number = 1) {
    this.loading.set(true);
    this.error.set(null);
    
    this.orderService.getAll(page).subscribe({
      next: (response) => {
        this.orders.set(response.results);
        this.totalCount.set(response.count);
        this.hasNext.set(response.next !== null);
        this.hasPrevious.set(response.previous !== null);
        this.currentPage.set(page);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar las órdenes. Por favor, intente nuevamente.');
        this.loading.set(false);
        console.error('Error loading orders:', err);
      }
    });
  }

  nextPage() {
    if (this.hasNext()) {
      this.loadOrders(this.currentPage() + 1);
    }
  }

  previousPage() {
    if (this.hasPrevious()) {
      this.loadOrders(this.currentPage() - 1);
    }
  }
}

