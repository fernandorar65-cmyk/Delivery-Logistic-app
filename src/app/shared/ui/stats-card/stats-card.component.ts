import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroIconComponent } from '@app/shared/ui/hero-icon/hero-icon';
import { StatCardItem } from '@app/shared/models/stat-card-item.model';

/**
 * Grid de tarjetas de estadísticas reutilizable para vistas de listado.
 * Usa StatCardItem (shared/models/stat-card-item.model).
 */
@Component({
  selector: 'app-stats-card',
  standalone: true,
  imports: [CommonModule, HeroIconComponent],
  templateUrl: './stats-card.component.html',
  styleUrl: './stats-card.component.css'
})
export class StatsCardComponent {
  @Input({ required: true }) stats: StatCardItem[] = [];
}
