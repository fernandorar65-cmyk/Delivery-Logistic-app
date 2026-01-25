import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroIconComponent } from '@app/shared/ui/hero-icon/hero-icon';

@Component({
  selector: 'app-clients-toolbar',
  standalone: true,
  imports: [CommonModule, HeroIconComponent],
  templateUrl: './clients-toolbar.component.html',
  styleUrl: './clients-toolbar.component.css'
})
export class ClientsToolbarComponent {
  @Input() showPendingToggle = false;
  @Input() pendingActive = false;
  @Input() pendingCount = 0;

  @Output() pendingToggle = new EventEmitter<void>();
}






