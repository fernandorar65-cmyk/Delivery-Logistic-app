import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-clients-toolbar',
  standalone: true,
  imports: [CommonModule, IconFieldModule, InputIconModule, InputTextModule, ButtonModule],
  templateUrl: './clients-toolbar.component.html',
  styleUrl: './clients-toolbar.component.css'
})
export class ClientsToolbarComponent {
  @Input() showPendingToggle = false;
  @Input() pendingActive = false;
  @Input() pendingCount = 0;

  @Output() pendingToggle = new EventEmitter<void>();

  clearFilters(): void {
    // Placeholder para futura lógica de limpiar filtros
  }
}






