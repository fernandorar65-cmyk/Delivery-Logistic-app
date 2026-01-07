import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OperationService } from '../../../services/operation.service';
import { Operation } from '../../../models/operation.model';

@Component({
  selector: 'app-operation-list-view',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './operation-list-view.component.html',
  styleUrl: './operation-list-view.component.css'
})
export class OperationListViewComponent {
  private operationService = inject(OperationService);
  
  operations = signal<Operation[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  currentPage = signal(1);
  totalCount = signal(0);
  hasNext = signal(false);
  hasPrevious = signal(false);

  constructor() {
    this.loadOperations(1);
  }

  loadOperations(page: number = 1) {
    this.loading.set(true);
    this.error.set(null);
    
    this.operationService.getAll(page).subscribe({
      next: (response) => {
        this.operations.set(response.results);
        this.totalCount.set(response.count);
        this.hasNext.set(response.next !== null);
        this.hasPrevious.set(response.previous !== null);
        this.currentPage.set(page);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar las operaciones. Por favor, intente nuevamente.');
        this.loading.set(false);
        console.error('Error loading operations:', err);
      }
    });
  }

  nextPage() {
    if (this.hasNext()) {
      this.loadOperations(this.currentPage() + 1);
    }
  }

  previousPage() {
    if (this.hasPrevious()) {
      this.loadOperations(this.currentPage() - 1);
    }
  }
}

