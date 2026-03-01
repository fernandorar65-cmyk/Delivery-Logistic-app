import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { StatCardItem } from '@app/shared/models/stat-card-item.model';

/**
 * Grid de tarjetas de estadísticas reutilizable. Usa PrimeNG p-card y solo CSS de maquetación.
 */
@Component({
  selector: 'app-stats-card',
  standalone: true,
  imports: [CommonModule, CardModule],
  templateUrl: './stats-card.component.html',
  styleUrl: './stats-card.component.css'
})
export class StatsCardComponent {
  @Input({ required: true }) stats: StatCardItem[] = [];

  /** Mapeo de nombres Heroicon a PrimeIcons (solo sufijo, ej. pi-th-large). */
  getPrimeIcon(icon: string): string {
    const map: Record<string, string> = {
      'squares-2x2': 'pi-th-large',
      'chart-bar': 'pi-chart-bar',
      'users': 'pi-users',
      'truck': 'pi-truck',
      'arrow-trending-up': 'pi-arrow-up',
      'arrow-trending-down': 'pi-arrow-down'
    };
    return map[icon] ?? 'pi-chart-line';
  }
}
