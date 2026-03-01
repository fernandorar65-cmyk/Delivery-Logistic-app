import { Component } from '@angular/core';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-dashboard-shipments-header',
  standalone: true,
  imports: [ToolbarModule, ButtonModule, TooltipModule, IconFieldModule, InputIconModule, InputTextModule],
  templateUrl: './dashboard-shipments-header.component.html',
  styleUrl: './dashboard-shipments-header.component.css'
})
export class DashboardShipmentsHeaderComponent {}






