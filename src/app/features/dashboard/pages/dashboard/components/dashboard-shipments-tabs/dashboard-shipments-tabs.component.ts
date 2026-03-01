import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabsModule } from 'primeng/tabs';
import { TagModule } from 'primeng/tag';
import { ShipmentStatus } from '../../dashboard-view.types';

export type DashboardTab = 'all' | ShipmentStatus;

@Component({
  selector: 'app-dashboard-shipments-tabs',
  standalone: true,
  imports: [CommonModule, TabsModule, TagModule],
  templateUrl: './dashboard-shipments-tabs.component.html',
  styleUrl: './dashboard-shipments-tabs.component.css'
})
export class DashboardShipmentsTabsComponent {
  @Input({ required: true }) activeTab!: DashboardTab;
  @Input({ required: true }) incidentsCount!: number;
  @Output() tabChange = new EventEmitter<DashboardTab>();

  setTab(tab: DashboardTab) {
    this.tabChange.emit(tab);
  }

  onValueChange(value: string | number | undefined) {
    if (value !== undefined) {
      this.tabChange.emit(value as DashboardTab);
    }
  }
}






