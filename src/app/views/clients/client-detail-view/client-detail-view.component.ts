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
      this.loadClient(Number(id));
    }
  }

  loadClient(id: number) {
    this.loading.set(true);
    this.error.set(null);

    this.clientService.getById(id).subscribe({
      next: (data) => {
        this.client.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar el cliente.');
        this.loading.set(false);
        console.error('Error loading client:', err);
      }
    });
  }
}

