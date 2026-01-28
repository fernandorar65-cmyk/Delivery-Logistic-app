import { Component, ElementRef, HostListener, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { HeroIconComponent } from '@app/shared/ui/hero-icon/hero-icon';
import { ClientService } from '@app/features/clients/services/client.service';
import { ProviderService } from '@app/features/providers/services/provider.service';
import { StorageService } from '@app/core/storage/storage.service';
import { LocalStorageEnums } from '@app/shared/models/local.storage.enums';
import { CompanyRequestPending } from '@app/features/clients/models/company-request-pending.model';
import { CompanyProviderPending } from '@app/features/providers/models/company-provider-pending.model';

interface MatchRequest {
  id: string;
  company: string;
  detail: string;
  time: string;
  icon: string;
  tone: string;
}

@Component({
  selector: 'app-match-requests-panel',
  standalone: true,
  imports: [CommonModule, RouterLink, HeroIconComponent],
  templateUrl: './match-requests-panel.component.html',
  styleUrl: './match-requests-panel.component.css'
})
export class MatchRequestsPanelComponent implements OnInit {
  private clientService = inject(ClientService);
  private providerService = inject(ProviderService);
  private storageService = inject(StorageService);

  isOpen = signal(false);
  loading = signal(false);
  error = signal<string | null>(null);
  requests = signal<MatchRequest[]>([]);
  processingId = signal<string | null>(null);
  userType = signal('');

  private loaded = false;

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    const storedType = this.storageService.getItem(LocalStorageEnums.USER_TYPE);
    this.userType.set((storedType ?? '').toLowerCase());
    this.loadRequests();
  }

  togglePanel() {
    this.isOpen.update(value => !value);
    if (this.isOpen()) {
      this.loadRequests();
    }
  }

  closePanel() {
    this.isOpen.set(false);
  }

  acceptRequest(requestId: string): void {
    this.processRequest(requestId, 'accept');
  }

  rejectRequest(requestId: string): void {
    this.processRequest(requestId, 'reject');
  }

  private loadRequests(): void {
    if (this.loading()) return;

    this.loading.set(true);
    this.error.set(null);
    if (this.isProviderUser()) {
      this.providerService.getPendingCompanyProviders()
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: (response) => {
            if (response?.errors?.length) {
              this.error.set('No se pudieron cargar las solicitudes.');
              this.requests.set([]);
              return;
            }
            const items = Array.isArray(response?.result) ? response.result : [];
            this.requests.set(items.map(item => this.mapProviderPendingToRequest(item)));
            this.loaded = true;
          },
          error: () => {
            this.error.set('No se pudieron cargar las solicitudes.');
            this.requests.set([]);
          }
        });
      return;
    }

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
          this.loaded = true;
        },
        error: () => {
          this.error.set('No se pudieron cargar las solicitudes.');
          this.requests.set([]);
        }
      });
  }

  private processRequest(requestId: string, action: 'accept' | 'reject'): void {
    if (this.processingId()) return;
    this.processingId.set(requestId);
    const request$ = this.isProviderUser()
      ? (action === 'accept'
        ? this.providerService.acceptCompanyProviderRequest(requestId)
        : this.providerService.rejectCompanyProviderRequest(requestId))
      : (action === 'accept'
        ? this.clientService.acceptCompanyClientRequest(requestId)
        : this.clientService.rejectCompanyClientRequest(requestId));
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

  isProcessing(requestId: string): boolean {
    return this.processingId() === requestId;
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

  private mapProviderPendingToRequest(item: CompanyProviderPending): MatchRequest {
    return {
      id: item.id,
      company: item.company_name,
      detail: `Proveedor: ${item.provider_name} · ${this.getStatusLabel(item.status)}`,
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

  private isProviderUser(): boolean {
    return this.userType() === 'provider';
  }

  @HostListener('document:click', ['$event'])
  handleClick(event: MouseEvent) {
    if (!this.isOpen()) return;
    const target = event.target as HTMLElement;
    if (!this.elementRef.nativeElement.contains(target)) {
      this.isOpen.set(false);
    }
  }
}






