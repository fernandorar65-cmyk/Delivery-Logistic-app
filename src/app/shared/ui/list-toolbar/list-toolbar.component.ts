import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeroIconComponent } from '@app/shared/ui/hero-icon/hero-icon';

/**
 * Toolbar reutilizable para vistas de listado (clientes, proveedores, empresas, etc.).
 * Incluye búsqueda opcional, acción principal opcional y proyección de contenido para filtros/acciones extra.
 */
@Component({
  selector: 'app-list-toolbar',
  standalone: true,
  imports: [CommonModule, FormsModule, HeroIconComponent],
  templateUrl: './list-toolbar.component.html',
  styleUrl: './list-toolbar.component.css'
})
export class ListToolbarComponent {
  /** Placeholder del campo de búsqueda. Si no se define, no se muestra búsqueda. */
  @Input() searchPlaceholder = '';

  /** Valor del campo de búsqueda (two-way con searchChange). */
  @Input() searchQuery = '';

  /** Emite cuando cambia el texto de búsqueda. */
  @Output() searchQueryChange = new EventEmitter<string>();

  /** Etiqueta del botón de acción principal (ej. "Nuevo cliente"). Si no se define, no se muestra. */
  @Input() primaryActionLabel = '';

  /** Icono para la acción principal (nombre Heroicon). */
  @Input() primaryActionIcon = 'plus';

  /** Emite cuando se hace clic en la acción principal. */
  @Output() primaryAction = new EventEmitter<void>();

  get showSearch(): boolean {
    return this.searchPlaceholder.length > 0;
  }

  get showPrimaryAction(): boolean {
    return this.primaryActionLabel.length > 0;
  }

  onSearchInput(value: string): void {
    this.searchQueryChange.emit(value);
  }
}
