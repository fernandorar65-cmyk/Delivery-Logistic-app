import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { ModalComponent } from '@app/shared/ui/modal/modal.component';
import { PasswordConfirmComponent } from '@app/shared/ui/password-confirm/password-confirm.component';

@Component({
  selector: 'app-clients-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent, PasswordConfirmComponent],
  templateUrl: './clients-form-modal.component.html',
  styleUrl: './clients-form-modal.component.css'
})
export class ClientsFormModalComponent {
  @Input({ required: true }) clientForm!: FormGroup;
  @Input({ required: true }) isEditMode!: boolean;
  @Input() formLoading = false;
  @Input() formError: string | null = null;
  @Input() checkLoading = false;
  @Input() checkError: string | null = null;
  @Input() checkSuccess: string | null = null;
  @Input() emailStatus: 'idle' | 'checking' | 'unique' | 'exists' | 'error' = 'idle';
  @Input() showEmailCheck = false;
  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<Event>();
  @Output() verifyEmail = new EventEmitter<void>();

  getFieldError(fieldName: string): string {
    const field = this.clientForm.get(fieldName);
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






