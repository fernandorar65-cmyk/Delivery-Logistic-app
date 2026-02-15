import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ClientService } from '@app/features/clients/services/client.service';
import { Client } from '@app/features/clients/models/client.model';
import { ClientDetailCardComponent } from './components/client-detail-card/client-detail-card.component';
import { hasApiErrors } from '@app/shared/utils/api-response';
import { ConfirmModalComponent } from '@app/shared/ui/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-client-detail-view',
  standalone: true,
  imports: [CommonModule, RouterLink, ClientDetailCardComponent, ConfirmModalComponent],
  templateUrl: './client-detail-view.component.html',
  styleUrl: './client-detail-view.component.css'
})
export class ClientDetailViewComponent implements OnInit {
  private clientService = inject(ClientService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  client = signal<Client | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  deleteConfirmOpen = signal(false);
  deleteError = signal<string | null>(null);
  deleteLoading = signal(false);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadClient(id);
    }
  }

  loadClient(id: string) {
    this.loading.set(true);
    this.error.set(null);

    this.clientService.getById(id).subscribe({
      next: (response) => {
        if (hasApiErrors(response)) {
          this.error.set('Error al cargar el cliente.');
          this.loading.set(false);
          return;
        }
        this.client.set(response.result);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar el cliente.');
        this.loading.set(false);
      }
    });
  }

  openDeleteConfirm() {
    if (!this.client()?.id) return;
    this.deleteError.set(null);
    this.deleteConfirmOpen.set(true);
  }

  closeDeleteConfirm() {
    this.deleteConfirmOpen.set(false);
    this.deleteError.set(null);
  }

  confirmDeleteClient() {
    const id = this.client()?.id;
    if (!id) return;
    this.deleteLoading.set(true);
    this.clientService.delete(id).subscribe({
      next: () => {
        this.deleteLoading.set(false);
        this.closeDeleteConfirm();
        this.router.navigate(['/clients']);
      },
      error: () => {
        this.deleteLoading.set(false);
        this.deleteError.set('Error al eliminar el cliente.');
      }
    });
  }
}







