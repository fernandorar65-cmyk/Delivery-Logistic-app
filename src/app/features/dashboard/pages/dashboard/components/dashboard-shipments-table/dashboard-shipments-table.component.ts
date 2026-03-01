import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Shipment } from '../../dashboard-view.types';

@Component({
  selector: 'app-dashboard-shipments-table',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    CardModule,
    TagModule,
    AvatarModule,
    ButtonModule,
    ProgressSpinnerModule
  ],
  templateUrl: './dashboard-shipments-table.component.html',
  styleUrl: './dashboard-shipments-table.component.css'
})
export class DashboardShipmentsTableComponent {
  @Input({ required: true }) shipments!: Shipment[];
  @Input({ required: true }) loading!: boolean;

  getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    const map: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      'in-route': 'info',
      pending: 'warn',
      delivered: 'success',
      incident: 'danger'
    };
    return map[status] ?? 'secondary';
  }
}






