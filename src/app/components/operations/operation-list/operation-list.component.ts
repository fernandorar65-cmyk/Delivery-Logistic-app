import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OperationService } from '../../../services/operation.service';
import { Operation } from '../../../models/operation.model';

@Component({
  selector: 'app-operation-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './operation-list.component.html',
  styleUrl: './operation-list.component.css'
})
export class OperationListComponent {
  private operationService = inject(OperationService);
  
  operations = signal<Operation[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor() {
    this.loadOperations();
  }

  loadOperations(page: number = 1) {
    this.loading.set(true);
    this.error.set(null);
    
    this.operationService.getAll(page).subscribe({
      next: (response) => {
        this.operations.set(response.results);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar las operaciones. Por favor, intente nuevamente.');
        this.loading.set(false);
        console.error('Error loading operations:', err);
      }
    });
  }
}

