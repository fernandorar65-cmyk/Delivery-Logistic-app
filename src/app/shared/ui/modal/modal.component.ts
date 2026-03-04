import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, DialogModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css'
})
export class ModalComponent {
  @Input({ required: true }) title!: string;
  @Input() size: ModalSize = 'md';
  @Input() showClose = true;
  @Output() close = new EventEmitter<void>();

  visible = true;

  readonly widthBySize: Record<ModalSize, string> = {
    sm: '26rem',
    md: '36rem',
    lg: '48rem',
    xl: '64rem'
  };

  onHide(): void {
    this.visible = false;
    this.close.emit();
  }
}






