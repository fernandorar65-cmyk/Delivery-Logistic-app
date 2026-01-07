import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OperationService } from '../../../services/operation.service';
import { Operation } from '../../../models/operation.model';

@Component({
  selector: 'app-operation-detail-view',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './operation-detail-view.component.html',
  styleUrl: './operation-detail-view.component.css'
})
export class OperationDetailViewComponent implements OnInit {
  private operationService = inject(OperationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  operation = signal<Operation | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadOperation(id);
    }
  }

  loadOperation(id: string) {
    this.loading.set(true);
    this.error.set(null);

    this.operationService.getById(id).subscribe({
      next: (data) => {
        this.operation.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar la operación.');
        this.loading.set(false);
        console.error('Error loading operation:', err);
      }
    });
  }
}

