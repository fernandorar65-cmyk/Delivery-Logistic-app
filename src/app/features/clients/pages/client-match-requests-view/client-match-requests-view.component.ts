import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { HeroIconComponent } from '@app/shared/ui/hero-icon/hero-icon';
import { EmptyStateComponent } from '@app/shared/ui/empty-state/empty-state.component';
import { ClientService } from '@app/features/clients/services/client.service';
import { CompanyRequestPending } from '@app/features/clients/models/company-request-pending.model';

interface MatchRequest {
  id: string;
  company: string;
  detail: string;
  time: string;
  icon: string;
  tone: string;
}

@Component({
  selector: 'app-client-match-requests-view',
  standalone: true,
  imports: [CommonModule, HeroIconComponent, EmptyStateComponent],
  templateUrl: './client-match-requests-view.component.html',
  styleUrl: './client-match-requests-view.component.css'
})
export class ClientMatchRequestsViewComponent implements OnInit {
  private clientService = inject(ClientService);

  loading = signal(false);
  error = signal<string | null>(null);
  requests = signal<MatchRequest[]>([]);
  processingId = signal<string | null>(null);

  ngOnInit(): void {
    this.loadRequests();
  }

  private loadRequests(): void {
    this.loading.set(true);
    this.error.set(null);
    this.clientService.getPendingCompanyClients()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          if (response?.errors?.length) {
            this.error.set('No se pudieron cargar las solicitudes.');
            this.requests.set([]);
            return;
          }
          const items = Array.isArray(response?.result) ? response.result : [];
          this.requests.set(items.map(item => this.mapPendingToRequest(item)));
        },
        error: () => {
          this.error.set('No se pudieron cargar las solicitudes.');
          this.requests.set([]);
        }
      });
  }

  acceptRequest(requestId: string): void {
    this.processRequest(requestId, 'accept');
  }

  rejectRequest(requestId: string): void {
    this.processRequest(requestId, 'reject');
  }

  isProcessing(requestId: string): boolean {
    return this.processingId() === requestId;
  }

  private processRequest(requestId: string, action: 'accept' | 'reject'): void {
    if (this.processingId()) return;
    this.processingId.set(requestId);
    const request$ = action === 'accept'
      ? this.clientService.acceptCompanyClientRequest(requestId)
      : this.clientService.rejectCompanyClientRequest(requestId);
    request$
      .pipe(finalize(() => this.processingId.set(null)))
      .subscribe({
        next: () => {
          this.requests.update(items => items.filter(item => item.id !== requestId));
        },
        error: () => {
          this.error.set('No se pudo procesar la solicitud.');
        }
      });
  }

  private mapPendingToRequest(item: CompanyRequestPending): MatchRequest {
    return {
      id: item.id,
      company: item.client_name,
      detail: `Empresa: ${item.company_name} · ${this.getStatusLabel(item.status)}`,
      time: this.formatDate(item.created_at),
      icon: 'users',
      tone: item.status === 'pending' ? 'tone-blue' : 'tone-green'
    };
  }

  private getStatusLabel(status?: string): string {
    const normalized = (status ?? '').toLowerCase();
    if (normalized === 'pending') return 'Pendiente';
    return 'En revisión';
  }

  private formatDate(value?: string): string {
    if (!value) return 'Sin fecha';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Sin fecha';
    return date.toLocaleDateString('es-PE', { year: 'numeric', month: 'short', day: '2-digit' });
  }
}
