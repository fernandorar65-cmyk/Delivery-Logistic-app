import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ClientService } from '../../../services/client.service';
import { Client } from '../../../models/client.model';

@Component({
  selector: 'app-client-detail-view',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
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
        if (response.errors && response.errors.length > 0) {
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
        console.error('Error loading client:', err);
      }
    });
  }

  deleteClient() {
    const id = this.client()?.id;
    if (!id) return;
    if (confirm('¿Está seguro de que desea eliminar este cliente?')) {
      this.loading.set(true);
      this.error.set(null);
      this.clientService.delete(id).subscribe({
        next: () => {
          this.router.navigate(['/clients']);
        },
        error: () => {
          this.loading.set(false);
          this.error.set('Error al eliminar el cliente.');
        }
      });
    }
  }
}

