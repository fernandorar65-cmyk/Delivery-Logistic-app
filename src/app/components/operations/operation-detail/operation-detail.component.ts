import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { OperationService } from '../../../services/operation.service';
import { Operation } from '../../../models/operation.model';

@Component({
  selector: 'app-operation-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './operation-detail.component.html',
  styleUrl: './operation-detail.component.css'
})
export class OperationDetailComponent implements OnInit {
  private operationService = inject(OperationService);
  private route = inject(ActivatedRoute);

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

