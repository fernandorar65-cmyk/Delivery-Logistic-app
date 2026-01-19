import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroIconComponent } from '../../../../../../components/hero-icon/hero-icon';
import { ModalComponent } from '../../../../../../shared/ui/modal/modal.component';

@Component({
  selector: 'app-vehicles-delete-modal',
  standalone: true,
  imports: [CommonModule, HeroIconComponent, ModalComponent],
  templateUrl: './vehicles-delete-modal.component.html',
  styleUrl: './vehicles-delete-modal.component.css'
})
export class VehiclesDeleteModalComponent {
  @Input() deleteLoading = false;
  @Input() deleteError: string | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();
}
