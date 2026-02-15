import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroIconComponent } from '@app/shared/ui/hero-icon/hero-icon';
import { ModalComponent } from '@app/shared/ui/modal/modal.component';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule, HeroIconComponent, ModalComponent],
  templateUrl: './confirm-modal.component.html',
  styleUrl: './confirm-modal.component.css'
})
export class ConfirmModalComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) message!: string;
  @Input() confirmLabel = 'Confirmar';
  @Input() cancelLabel = 'Cancelar';
  @Input() loading = false;
  @Input() error: string | null = null;
  @Input() danger = true;
  @Output() confirm = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();
}
