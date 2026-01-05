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

  constructor() {
    this.loadClients();
  }

  loadClients() {
    this.loading.set(true);
    this.error.set(null);
    
    this.clientService.getAll().subscribe({
      next: (data) => {
        this.clients.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar los clientes. Por favor, intente nuevamente.');
        this.loading.set(false);
        console.error('Error loading clients:', err);
      }
    });
  }

  deleteClient(id: number) {
    if (confirm('¿Está seguro de que desea eliminar este cliente?')) {
      // Nota: El endpoint DELETE no está disponible para clients según la API
      // Si se necesita, se debería agregar al servicio
      console.log('Delete client:', id);
    }
  }
}

