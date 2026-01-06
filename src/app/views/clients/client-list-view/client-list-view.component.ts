import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ClientService } from '../../../services/client.service';
import { Client } from '../../../models/client.model';

@Component({
  selector: 'app-client-list-view',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './client-list-view.component.html',
  styleUrl: './client-list-view.component.css'
})
export class ClientListViewComponent {
  private clientService = inject(ClientService);
  
  clients = signal<Client[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  currentPage = signal(1);
  totalCount = signal(0);
  hasNext = signal(false);
  hasPrevious = signal(false);

  constructor() {
    this.loadClients(1);
  }

  loadClients(page: number = 1) {
    this.loading.set(true);
    this.error.set(null);
    
    this.clientService.getAll(page).subscribe({
      next: (response) => {
        this.clients.set(response.results);
        this.totalCount.set(response.count);
        this.hasNext.set(response.next !== null);
        this.hasPrevious.set(response.previous !== null);
        this.currentPage.set(page);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar los clientes. Por favor, intente nuevamente.');
        this.loading.set(false);
        console.error('Error loading clients:', err);
      }
    });
  }

  nextPage() {
    if (this.hasNext()) {
      this.loadClients(this.currentPage() + 1);
    }
  }

  previousPage() {
    if (this.hasPrevious()) {
      this.loadClients(this.currentPage() - 1);
    }
  }

  deleteClient(id: number) {
    if (confirm('¿Está seguro de que desea eliminar este cliente?')) {
      // Nota: El endpoint DELETE no está disponible para clients según la API
      // Si se necesita, se debería agregar al servicio
      console.log('Delete client:', id);
    }
  }
}

