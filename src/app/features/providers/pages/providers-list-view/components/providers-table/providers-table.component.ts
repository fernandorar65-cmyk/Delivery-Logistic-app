import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Ally } from '../../providers-list-view.types';
import { EmptyStateComponent } from '@app/shared/ui/empty-state/empty-state.component';
import { LoadingCardComponent } from '@app/shared/ui/loading-card/loading-card.component';
import { TableModule } from 'primeng/table';
import { AvatarModule } from 'primeng/avatar';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-providers-table',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    EmptyStateComponent,
    LoadingCardComponent,
    TableModule,
    AvatarModule,
    TagModule,
    ButtonModule,
    TooltipModule
  ],
  templateUrl: './providers-table.component.html',
  styleUrl: './providers-table.component.css'
})
export class ProvidersTableComponent {
  @Input() loading = false;
  @Input() error: string | null = null;
  @Input() allies: Ally[] = [];
  @Input() showEmail = false;
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

  getStatusSeverity(status?: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    if (!status) return 'secondary';
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'secondary';
      case 'pending':
        return 'warn';
      default:
        return 'secondary';
    }
  }

  /** ID corto para la tabla (primeros 8 caracteres); tooltip muestra el UUID completo */
  getShortId(id: string | undefined): string {
    if (!id) return '—';
    return id.length > 8 ? `#${id.slice(0, 8)}` : `#${id}`;
  }
}






