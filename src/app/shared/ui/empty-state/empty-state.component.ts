import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroIconComponent } from '../../../components/hero-icon/hero-icon';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, HeroIconComponent],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.css'
})
export class EmptyStateComponent {
  @Input({ required: true }) title!: string;
  @Input() description?: string | null;
  @Input() icon?: string;
  @Input() iconSize = 56;
  @Input() actionLabel?: string;
  @Input() actionDisabled = false;
  @Output() action = new EventEmitter<void>();
}
