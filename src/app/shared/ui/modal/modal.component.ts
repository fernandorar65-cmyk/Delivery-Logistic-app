import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroIconComponent } from '../../../components/hero-icon/hero-icon';

export type ModalSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, HeroIconComponent],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css'
})
export class ModalComponent {
  @Input({ required: true }) title!: string;
  @Input() size: ModalSize = 'md';
  @Input() showClose = true;
  @Output() close = new EventEmitter<void>();
}
