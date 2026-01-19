import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroIconComponent } from '../../../../../components/hero-icon/hero-icon';

@Component({
  selector: 'app-dashboard-metrics',
  standalone: true,
  imports: [CommonModule, HeroIconComponent],
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
}
