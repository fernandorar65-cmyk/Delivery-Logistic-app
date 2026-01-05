import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { InternalClientService } from '../../../services/internal-client.service';
import { InternalClient } from '../../../models/internal-client.model';

@Component({
  selector: 'app-internal-client-list-view',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './internal-client-list-view.component.html',
  styleUrl: './internal-client-list-view.component.css'
})
export class InternalClientListViewComponent {
  private internalClientService = inject(InternalClientService);
  
  internalClients = signal<InternalClient[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor() {
    this.loadInternalClients();
  }

  loadInternalClients() {
    this.loading.set(true);
    this.error.set(null);
    
    this.internalClientService.getAll().subscribe({
      next: (data) => {
        this.internalClients.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar los clientes internos. Por favor, intente nuevamente.');
        this.loading.set(false);
        console.error('Error loading internal clients:', err);
      }
    });
  }

  deleteInternalClient(id: number) {
    if (confirm('¿Está seguro de que desea eliminar este cliente interno?')) {
      this.loading.set(true);
      this.internalClientService.delete(id).subscribe({
        next: () => {
          this.loadInternalClients();
        },
        error: (err) => {
          this.error.set('Error al eliminar el cliente interno.');
          this.loading.set(false);
          console.error('Error deleting internal client:', err);
        }
      });
    }
  }
}

