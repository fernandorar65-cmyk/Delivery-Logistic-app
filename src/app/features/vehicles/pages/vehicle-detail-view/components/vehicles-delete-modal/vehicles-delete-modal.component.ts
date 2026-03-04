import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-vehicles-delete-modal',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule],
  templateUrl: './vehicles-delete-modal.component.html',
  styleUrl: './vehicles-delete-modal.component.css'
})
export class VehiclesDeleteModalComponent {
  @Input() deleteLoading = false;
  @Input() deleteError: string | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();

  visible = true;

  onHide(): void {
    this.close.emit();
  }
}






