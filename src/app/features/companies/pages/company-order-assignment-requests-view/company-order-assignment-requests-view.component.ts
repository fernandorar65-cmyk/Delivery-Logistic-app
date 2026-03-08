import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CompanyService } from '@app/features/companies/services/company.service';
import { OrderAssignmentRequest } from '@app/features/companies/models/order-assignment-request.model';
import { Company } from '@app/features/companies/models/company.model';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToolbarModule } from 'primeng/toolbar';
import { MessageModule } from 'primeng/message';
import { TooltipModule } from 'primeng/tooltip';
import { RippleModule } from 'primeng/ripple';
import { BadgeModule } from 'primeng/badge';
import { SkeletonModule } from 'primeng/skeleton';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SelectModule } from 'primeng/select';
import { PaginatorModule } from 'primeng/paginator';
import type { PaginatorState } from 'primeng/paginator';
import { EmptyStateComponent } from '@app/shared/ui/empty-state/empty-state.component';

@Component({
  selector: 'app-company-order-assignment-requests-view',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    TableModule,
    TagModule,
    ButtonModule,
    CardModule,
    ToolbarModule,
    MessageModule,
    TooltipModule,
    RippleModule,
    BadgeModule,
    SkeletonModule,
    ProgressSpinnerModule,
    SelectModule,
    PaginatorModule,
    EmptyStateComponent
  ],
  templateUrl: './company-order-assignment-requests-view.component.html',
  styleUrl: './company-order-assignment-requests-view.component.css'
})
export class CompanyOrderAssignmentRequestsViewComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private companyService = inject(CompanyService);

  companyId = signal<string | null>(null);
  companyName = signal<string>('');
  requests = signal<OrderAssignmentRequest[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  /** ID de la solicitud sobre la que se está ejecutando una acción (aceptar/rechazar). */
  actionRequestId = signal<string | null>(null);
  actionError = signal<string | null>(null);

  /** Paginación: página actual (1, 2, 3...) y total del API. Solo se envía page al API. */
  currentPage = signal(1);
  totalCount = signal(0);
  /** Tamaño de página fijo para el paginador (el API usa su propio tamaño; aquí solo mostramos página 1,2,3...). */
  rowsPerPage = 10;

  /** Filtro por estado: '' = todos, 'pending' | 'accepted' | 'rejected'. */
  statusFilter = signal<string>('');

  /** Opciones para el filtro de estado (valores del API: accepted, rejected, pending). */
  statusOptions = [
    { label: 'Todos los estados', value: '' },
    { label: 'Pendiente', value: 'pending' },
    { label: 'Aceptado', value: 'accepted' },
    { label: 'Rechazado', value: 'rejected' }
  ];

  /** Cantidad de solicitudes pendientes (para badge). */
  pendingCount = computed(() => this.requests().filter((r) => this.canAcceptOrReject(r)).length);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('No se especificó la compañía.');
      this.loading.set(false);
      return;
    }
    this.companyId.set(id);
    this.loadCompanyAndRequests(id);
  }

  private loadCompanyAndRequests(id: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.companyService.getById(id).subscribe({
      next: (res) => {
        const company = res?.result as Company | undefined;
        this.companyName.set(company?.company_name ?? company?.name ?? 'Compañía');
      },
      error: () => {
        this.companyName.set('Compañía');
      }
    });

    this.loadRequests(id);
  }

  /** Carga solicitudes con page (1,2,3...) y status (accepted | rejected | pending). */
  private loadRequests(companyId: string): void {
    this.loading.set(true);
    this.error.set(null);
    const page = this.currentPage();
    const status = this.statusFilter();
    const statusParam =
      status === 'accepted' || status === 'rejected' || status === 'pending' ? status : undefined;
    this.companyService
      .getOrderAssignmentRequests(companyId, {
        page,
        ...(statusParam ? { status: statusParam } : {})
      })
      .subscribe({
        next: (response) => {
          this.requests.set(response?.result ?? []);
          this.totalCount.set(response?.pagination?.total ?? 0);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('No se pudieron cargar las solicitudes de asignación.');
          this.requests.set([]);
          this.totalCount.set(0);
          this.loading.set(false);
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/companies']);
  }

  retry(): void {
    const id = this.companyId();
    if (id) this.loadCompanyAndRequests(id);
  }

  onStatusChange(value: string): void {
    this.statusFilter.set(value ?? '');
    this.currentPage.set(1);
    const id = this.companyId();
    if (id) this.loadRequests(id);
  }

  onPageChange(event: PaginatorState): void {
    const first = event?.first ?? 0;
    const rows = event?.rows ?? 10;
    const page = Math.floor(first / rows) + 1;
    this.currentPage.set(page);
    const id = this.companyId();
    if (id) this.loadRequests(id);
  }

  isPending(req: OrderAssignmentRequest): boolean {
    const s = (req.status ?? '').toLowerCase();
    return s.includes('pend') || s === 'pending' || s === 'pendiente' || s === '';
  }

  /** True si se pueden mostrar y usar los botones Aceptar/Rechazar (solicitud pendiente o estado no final). */
  canAcceptOrReject(req: OrderAssignmentRequest): boolean {
    const s = (req.status ?? '').toLowerCase();
    if (s.includes('accept') || s.includes('approved') || s.includes('aceptad')) return false;
    if (s.includes('reject') || s.includes('rechazad') || s.includes('denied')) return false;
    return true;
  }

  acceptRequest(req: OrderAssignmentRequest): void {
    const cid = this.companyId();
    const rid = req.id;
    if (!cid || !rid) return;
    this.actionError.set(null);
    this.actionRequestId.set(rid);
    this.companyService.acceptOrderAssignmentRequest(cid, rid).subscribe({
      next: () => {
        this.actionRequestId.set(null);
        this.refreshRequests();
      },
      error: () => {
        this.actionRequestId.set(null);
        this.actionError.set('No se pudo aceptar la solicitud.');
      }
    });
  }

  rejectRequest(req: OrderAssignmentRequest): void {
    const cid = this.companyId();
    const rid = req.id;
    if (!cid || !rid) return;
    this.actionError.set(null);
    this.actionRequestId.set(rid);
    this.companyService.rejectOrderAssignmentRequest(cid, rid).subscribe({
      next: () => {
        this.actionRequestId.set(null);
        this.refreshRequests();
      },
      error: () => {
        this.actionRequestId.set(null);
        this.actionError.set('No se pudo rechazar la solicitud.');
      }
    });
  }

  refreshRequests(): void {
    const id = this.companyId();
    if (!id) return;
    this.loadRequests(id);
  }

  getOrderDisplay(req: OrderAssignmentRequest): string {
    const orders = req.orders;
    if (orders?.length) {
      return orders.map((o) => o.tracking_number || o.id || '—').join(', ');
    }
    return req.order_count ? `${req.order_count} pedido(s)` : '—';
  }

  /** Resumen de pedidos para la columna (tracking numbers). */
  getOrdersSummary(req: OrderAssignmentRequest): string {
    const orders = req.orders;
    if (!orders?.length) return '—';
    return orders.map((o) => o.tracking_number || o.id).filter(Boolean).join(', ') || '—';
  }

  getStatusDisplay(req: OrderAssignmentRequest): string {
    return req.status_display ?? req.status ?? '—';
  }

  /** Ruta(s) origen → destino para mostrar en la columna y tooltip. */
  getRouteSummary(req: OrderAssignmentRequest): string {
    const orders = req.orders;
    if (!orders?.length) return '—';
    return orders.map((o) => o.origen_destino || `${o.origen ?? '—'} → ${o.destino ?? '—'}`).filter(Boolean).join('\n') || '—';
  }

  /** Primera ruta (para celda truncada). */
  getFirstRoute(req: OrderAssignmentRequest): string {
    const first = req.orders?.[0];
    if (!first) return '—';
    return first.origen_destino || `${first.origen ?? ''} → ${first.destino ?? ''}`.trim() || '—';
  }

  getStatusSeverity(status?: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const s = (status ?? '').toLowerCase();
    if (s.includes('pend') || s.includes('pending')) return 'warn';
    if (s.includes('accept') || s.includes('approved')) return 'success';
    if (s.includes('reject')) return 'danger';
    return 'secondary';
  }

  formatDate(value: string | undefined): string {
    if (!value) return '—';
    try {
      const d = new Date(value);
      return d.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return value;
    }
  }
}
