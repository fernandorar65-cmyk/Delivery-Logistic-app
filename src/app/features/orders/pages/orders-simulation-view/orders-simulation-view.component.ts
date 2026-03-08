import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageModule } from 'primeng/message';
import { ButtonModule } from 'primeng/button';
import { CompanyService } from '@app/features/companies/services/company.service';
import { StorageService } from '@app/core/storage/storage.service';
import { LocalStorageEnums } from '@app/shared/models/local.storage.enums';
import { RouteOptimizationService } from '@app/core/services/route-optimization.service';
import { OrdersSimulationResultService } from '@app/features/orders/services/orders-simulation-result.service';
import type { OrderAssignmentOrder } from '@app/features/companies/models/order-assignment-request.model';
import type { OptimizeRoutesRequest, OptimizeRoutesResponse } from '@app/core/models/optimize-routes.model';
import { orsResponseToOrders } from '@app/features/orders/pages/orders-map-view/orders-map-view.component';
import type { ORSRoutesResponse } from '@app/features/orders/pages/orders-map-view/orders-map-view.component';

export interface FlattenedAcceptedOrder {
  rowId: string;
  order: OrderAssignmentOrder;
}

@Component({
  selector: 'app-orders-simulation-view',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    TableModule,
    CheckboxModule,
    InputNumberModule,
    MessageModule,
    ButtonModule
  ],
  templateUrl: './orders-simulation-view.component.html',
  styleUrl: './orders-simulation-view.component.css'
})
export class OrdersSimulationViewComponent implements OnInit {
  private companyService = inject(CompanyService);
  private storageService = inject(StorageService);
  private routeOptimizationService = inject(RouteOptimizationService);
  private simulationResultService = inject(OrdersSimulationResultService);
  private router = inject(Router);

  private readonly DEFAULT_DEPOT = { lat: -12.06, lon: -77.04 };

  acceptedOrdersList = signal<FlattenedAcceptedOrder[]>([]);
  acceptedOrdersLoading = signal(false);
  acceptedOrdersError = signal<string | null>(null);
  companyId = signal<string | null>(null);
  selectedRowIdsForSimulation = signal<Set<string>>(new Set());
  vehicleCount = signal(1);
  simulationLoading = signal(false);
  simulationError = signal<string | null>(null);

  ngOnInit(): void {
    this.loadAcceptedOrders();
  }

  loadAcceptedOrders(): void {
    const cid = this.storageService.getItem(LocalStorageEnums.ID);
    this.companyId.set(cid);
    if (!cid) {
      this.acceptedOrdersError.set('No se encontró compañía. Inicie sesión como compañía.');
      this.acceptedOrdersLoading.set(false);
      return;
    }
    this.acceptedOrdersLoading.set(true);
    this.acceptedOrdersError.set(null);
    this.companyService.getOrderAssignmentRequests(cid, { status: 'accepted' }).subscribe({
      next: (response) => {
        const requests = response?.result ?? [];
        const list: FlattenedAcceptedOrder[] = [];
        requests.forEach((req, reqIndex) => {
          (req.orders ?? []).forEach((order, idx) => {
            list.push({
              rowId: `${req.id ?? reqIndex}-${order.id ?? order.tracking_number ?? idx}`,
              order
            });
          });
        });
        this.acceptedOrdersList.set(list);
        this.acceptedOrdersLoading.set(false);
      },
      error: () => {
        this.acceptedOrdersError.set('No se pudieron cargar las órdenes aceptadas.');
        this.acceptedOrdersList.set([]);
        this.acceptedOrdersLoading.set(false);
      }
    });
  }

  isRowSelectedForSimulation(rowId: string): boolean {
    return this.selectedRowIdsForSimulation().has(rowId);
  }

  toggleSelectOrderForSimulation(rowId: string): void {
    const cur = this.selectedRowIdsForSimulation();
    const next = new Set(cur);
    if (next.has(rowId)) next.delete(rowId);
    else next.add(rowId);
    this.selectedRowIdsForSimulation.set(next);
  }

  selectAllOrdersForSimulation(): void {
    this.selectedRowIdsForSimulation.set(new Set(this.acceptedOrdersList().map(r => r.rowId)));
  }

  clearSelectionForSimulation(): void {
    this.selectedRowIdsForSimulation.set(new Set());
  }

  private buildOptimizePayload(): OptimizeRoutesRequest | null {
    const list = this.acceptedOrdersList();
    const ids = this.selectedRowIdsForSimulation();
    const selected = list.filter(r => ids.has(r.rowId));
    if (selected.length === 0) return null;
    const depot = this.DEFAULT_DEPOT;
    const orders = selected.map((r, i) => {
      const o = r.order;
      return {
        id: i + 1,
        lat: o.lat ?? depot.lat + i * 0.01,
        lon: o.lon ?? depot.lon + i * 0.01
      };
    });
    const n = Math.max(1, Math.min(20, this.vehicleCount()));
    const vehicles = Array.from({ length: n }, (_, i) => ({
      id: i + 1,
      start_lat: depot.lat,
      start_lon: depot.lon
    }));
    return { orders, vehicles };
  }

  simulateRoute(): void {
    const payload = this.buildOptimizePayload();
    if (!payload) {
      this.simulationError.set('Seleccione al menos una orden.');
      return;
    }
    this.simulationError.set(null);
    this.simulationLoading.set(true);
    this.routeOptimizationService.optimizeRoutes(payload).subscribe({
      next: (response: OptimizeRoutesResponse) => {
        this.simulationLoading.set(false);
        const raw = response as unknown as Record<string, unknown>;
        const data = raw['result'] ?? response;
        const dataObj = data as Record<string, unknown>;
        const rawRoutes = dataObj['routes'];
        const routes = Array.isArray(rawRoutes)
          ? rawRoutes
          : rawRoutes && typeof rawRoutes === 'object'
            ? Object.values(rawRoutes)
            : [];
        const unassigned = dataObj['unassigned'];
        const payloadForMap = {
          routes,
          unassigned: Array.isArray(unassigned) ? unassigned : []
        };
        const orders = orsResponseToOrders(payloadForMap as ORSRoutesResponse);
        this.simulationResultService.setResult(orders);
        this.router.navigate(['/orders/map']);
      },
      error: () => {
        this.simulationLoading.set(false);
        this.simulationError.set('Error al simular rutas. Verifique el endpoint.');
      }
    });
  }

  formatOrderDeadline(value: string | undefined): string {
    if (!value) return '—';
    try {
      return new Date(value).toLocaleDateString('es-ES', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return value;
    }
  }
}
