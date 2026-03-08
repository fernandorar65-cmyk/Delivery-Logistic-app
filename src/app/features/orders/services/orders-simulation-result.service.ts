import { Injectable, signal } from '@angular/core';

/**
 * Almacena el resultado de la simulación de rutas para mostrarlo en la subruta /orders/map.
 * La vista de simulación (orders) llama setResult() y navega a /orders/map;
 * la vista del mapa lee getResult() en init.
 */
@Injectable({
  providedIn: 'root'
})
export class OrdersSimulationResultService {
  private readonly result = signal<unknown[] | null>(null);

  setResult(orders: unknown[]): void {
    this.result.set(orders);
  }

  getResult(): unknown[] | null {
    return this.result();
  }

  clearResult(): void {
    this.result.set(null);
  }
}
