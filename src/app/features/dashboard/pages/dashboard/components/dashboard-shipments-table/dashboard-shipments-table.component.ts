import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroIconComponent } from '@app/shared/ui/hero-icon/hero-icon';
import { Shipment } from '../../dashboard-view.types';

@Component({
  selector: 'app-dashboard-shipments-table',
  standalone: true,
  imports: [CommonModule, HeroIconComponent],
  templateUrl: './dashboard-shipments-table.component.html',
  styleUrl: './dashboard-shipments-table.component.css'
})
export class DashboardShipmentsTableComponent {
  @Input({ required: true }) shipments!: Shipment[];
  @Input({ required: true }) loading!: boolean;
}






