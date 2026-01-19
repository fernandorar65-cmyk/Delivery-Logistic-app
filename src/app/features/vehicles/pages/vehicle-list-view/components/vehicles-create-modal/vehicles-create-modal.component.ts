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
  selector: 'app-vehicles-create-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HeroIconComponent, ModalComponent],
  templateUrl: './vehicles-create-modal.component.html',
  styleUrl: './vehicles-create-modal.component.css'
})
export class VehiclesCreateModalComponent {
  @Input({ required: true }) createForm!: FormGroup;
  @Input({ required: true }) vehicleTypes!: SelectOption[];
  @Input({ required: true }) statusOptions!: SelectOption[];
  @Input({ required: true }) allyLabel!: string;
  @Input() createLoading = false;
  @Input() createError: string | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<void>();
}






