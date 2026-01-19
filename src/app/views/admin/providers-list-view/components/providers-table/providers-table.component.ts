import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HeroIconComponent } from '../../../../../components/hero-icon/hero-icon';
import { Ally } from '../../providers-list-view.types';
import { EmptyStateComponent } from '../../../../../shared/ui/empty-state/empty-state.component';
import { LoadingCardComponent } from '../../../../../shared/ui/loading-card/loading-card.component';

@Component({
  selector: 'app-providers-table',
  standalone: true,
  imports: [CommonModule, RouterLink, HeroIconComponent, EmptyStateComponent, LoadingCardComponent],
  templateUrl: './providers-table.component.html',
  styleUrl: './providers-table.component.css'
})
export class ProvidersTableComponent {
  @Input() loading = false;
  @Input() error: string | null = null;
  @Input() allies: Ally[] = [];
  @Output() createRequested = new EventEmitter<void>();

  getStatusClass(status?: string): string {
    if (!status) return '';
    switch (status) {
      case 'active':
        return 'status-active';
      case 'inactive':
        return 'status-inactive';
      case 'pending':
        return 'status-pending';
      default:
        return '';
    }
  }

  getStatusLabel(status?: string): string {
    if (!status) return 'Desconocido';
    switch (status) {
      case 'active':
        return 'Activo';
      case 'inactive':
        return 'Inactivo';
      case 'pending':
        return 'Pendiente';
      default:
        return status;
    }
  }
}
