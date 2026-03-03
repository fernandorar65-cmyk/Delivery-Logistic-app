import { Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import type { SidebarSection } from '@app/core/layout/models/sidebar.model';

@Component({
  selector: 'app-sidebar-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar-nav.component.html',
  styleUrl: './sidebar-nav.component.css'
})
export class SidebarNavComponent {
  /** Secciones del menú (PRINCIPAL, GESTIÓN, etc.) */
  sections = input.required<SidebarSection[]>();
}
