import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { InternalClientService } from '../../../services/internal-client.service';
import { InternalClient } from '../../../models/internal-client.model';

@Component({
  selector: 'app-internal-client-detail-view',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './internal-client-detail-view.component.html',
  styleUrl: './internal-client-detail-view.component.css'
})
export class InternalClientDetailViewComponent implements OnInit {
  private internalClientService = inject(InternalClientService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  internalClient = signal<InternalClient | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadInternalClient(Number(id));
    }
  }

  loadInternalClient(id: number) {
    this.loading.set(true);
    this.error.set(null);

    this.internalClientService.getById(id).subscribe({
      next: (data) => {
        this.internalClient.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar el cliente interno.');
        this.loading.set(false);
        console.error('Error loading internal client:', err);
      }
    });
  }
}

