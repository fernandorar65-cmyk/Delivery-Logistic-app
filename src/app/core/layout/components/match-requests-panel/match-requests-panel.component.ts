import { Component, ElementRef, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { HeroIconComponent } from '@app/shared/ui/hero-icon/hero-icon';
import { ClientService } from '@app/features/clients/services/client.service';
import { StorageService } from '@app/core/storage/storage.service';
import { LocalStorageEnums } from '@app/shared/models/local.storage.enums';
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
  selector: 'app-match-requests-panel',
  standalone: true,
  imports: [CommonModule, RouterLink, HeroIconComponent],
  templateUrl: './match-requests-panel.component.html',
  styleUrl: './match-requests-panel.component.css'
})
export class MatchRequestsPanelComponent {
  private clientService = inject(ClientService);
  private storageService = inject(StorageService);

  isOpen = signal(false);
  loading = signal(false);
  error = signal<string | null>(null);
  requests = signal<MatchRequest[]>([]);

  private loaded = false;

  constructor(private elementRef: ElementRef) {}

  togglePanel() {
    this.isOpen.update(value => !value);
    if (this.isOpen()) {
      this.loadRequests();
    }
  }

  closePanel() {
    this.isOpen.set(false);
  }

  private loadRequests(): void {
    if (this.loading()) return;

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
        this.loaded = true;
      },
      error: () => {
        this.error.set('No se pudieron cargar las solicitudes.');
        this.requests.set([]);
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

  @HostListener('document:click', ['$event'])
  handleClick(event: MouseEvent) {
    if (!this.isOpen()) return;
    const target = event.target as HTMLElement;
    if (!this.elementRef.nativeElement.contains(target)) {
      this.isOpen.set(false);
    }
  }
}






