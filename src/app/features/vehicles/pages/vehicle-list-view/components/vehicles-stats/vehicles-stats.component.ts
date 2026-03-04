import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { StatCard } from '../../vehicle-list-view.types';

@Component({
  selector: 'app-vehicles-stats',
  standalone: true,
  imports: [CommonModule, CardModule, TagModule],
  templateUrl: './vehicles-stats.component.html',
  styleUrl: './vehicles-stats.component.css'
})
export class VehiclesStatsComponent {
  @Input({ required: true }) stats: StatCard[] = [];

  getStatIcon(icon: string): string {
    const map: Record<string, string> = {
      truck: 'pi-truck',
      'map-pin': 'pi-map-marker',
      'wrench-screwdriver': 'pi-wrench',
      'check-circle': 'pi-check-circle'
    };
    return 'pi ' + (map[icon] || 'pi-chart-bar');
  }

  getTrendSeverity(trend?: string): 'success' | 'danger' | 'secondary' {
    if (trend === 'up') return 'success';
    if (trend === 'down') return 'danger';
    return 'secondary';
  }
}
