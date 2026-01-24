import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { HeroIconComponent } from '@app/shared/ui/hero-icon/hero-icon';
import { ModalComponent } from '@app/shared/ui/modal/modal.component';

interface SelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-vehicles-edit-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent],
  templateUrl: './vehicles-edit-modal.component.html',
  styleUrl: './vehicles-edit-modal.component.css'
})
export class VehiclesEditModalComponent {
  @Input({ required: true }) editForm!: FormGroup;
  @Input({ required: true }) vehicleTypes!: SelectOption[];
  @Input({ required: true }) statusOptions!: SelectOption[];
  @Input() editLoading = false;
  @Input() editError: string | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<void>();
}






