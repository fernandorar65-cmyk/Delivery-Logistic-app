import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-dashboard-metrics',
  standalone: true,
  imports: [CommonModule, CardModule, TagModule],
  templateUrl: './dashboard-metrics.component.html',
  styleUrl: './dashboard-metrics.component.css'
})
export class DashboardMetricsComponent {
  @Input({ required: true }) totalShipments!: number;
  @Input({ required: true }) totalShipmentsChange!: { value: number; isPositive: boolean };
  @Input({ required: true }) deliveredSuccess!: number;
  @Input({ required: true }) deliveredSuccessChange!: { value: number; isPositive: boolean };
  @Input({ required: true }) awaitingAssignment!: number;
  @Input({ required: true }) activeIncidents!: number;
  @Input({ required: true }) activeIncidentsChange!: { value: number; isPositive: boolean };

  /** Sparkline subida (para tarjetas positivas) */
  sparklineUp = 'M0,20 L15,14 L30,18 L45,8 L60,12 L80,4';
  /** Sparkline bajada (para tarjetas negativas) */
  sparklineDown = 'M0,8 L15,14 L30,10 L45,16 L60,12 L80,20';
}






