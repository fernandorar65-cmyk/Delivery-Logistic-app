import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { HeroIconComponent } from '../../../../../components/hero-icon/hero-icon';
import { ModalComponent } from '../../../../../shared/ui/modal/modal.component';

@Component({
  selector: 'app-companies-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HeroIconComponent, ModalComponent],
  templateUrl: './companies-form-modal.component.html',
  styleUrl: './companies-form-modal.component.css'
})
export class CompaniesFormModalComponent {
  @Input({ required: true }) companyForm!: FormGroup;
  @Input({ required: true }) isEditMode!: boolean;
  @Input() formLoading = false;
  @Input() formError: string | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<Event>();

  getFieldError(fieldName: string): string {
    const field = this.companyForm.get(fieldName);
    if (field?.hasError('required')) {
      return 'Este campo es requerido';
    }
    if (field?.hasError('email')) {
      return 'Email inválido';
    }
    if (field?.hasError('minlength')) {
      return `Mínimo ${field.errors?.['minlength']?.requiredLength ?? 0} caracteres`;
    }
    return '';
  }
}
