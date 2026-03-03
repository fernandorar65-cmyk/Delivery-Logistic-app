import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import type { SidebarSection } from '@app/core/layout/models/sidebar.model';

@Component({
  selector: 'app-sidebar-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, ButtonModule, TooltipModule],
  templateUrl: './sidebar-nav.component.html',
  styleUrl: './sidebar-nav.component.css'
})
export class SidebarNavComponent {
  sections = input.required<SidebarSection[]>();
  collapsed = input<boolean>(false);
  toggle = output<void>();
}
