import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

export interface ProviderCreatePayload {
  company_name: string;
  tax_id: string;
  contact_email: string;
  phone: string;
  representative_name: string;
  fleet_type: string;
  operation_zone: string;
  status: 'active' | 'inactive';
  logo_file?: File | null;
}

@Component({
  selector: 'app-provider-create-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './provider-create-modal.component.html',
  styleUrl: './provider-create-modal.component.css'
})
export class ProviderCreateModalComponent {
  private fb = inject(FormBuilder);

  @Input() open = false;
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<ProviderCreatePayload>();

  form = this.fb.group({
    company_name: ['', [Validators.required, Validators.minLength(2)]],
    tax_id: ['', [Validators.required, Validators.minLength(6)]],
    contact_email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.minLength(6)]],
    representative_name: ['', [Validators.required, Validators.minLength(2)]],
    fleet_type: ['', Validators.required],
    operation_zone: ['', [Validators.required, Validators.minLength(2)]],
    status: ['active', Validators.required],
    logo_file: [null as File | null]
  });

  close(): void {
    this.closed.emit();
  }

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.form.patchValue({ logo_file: file });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: ProviderCreatePayload = {
      company_name: this.form.value.company_name ?? '',
      tax_id: this.form.value.tax_id ?? '',
      contact_email: this.form.value.contact_email ?? '',
      phone: this.form.value.phone ?? '',
      representative_name: this.form.value.representative_name ?? '',
      fleet_type: this.form.value.fleet_type ?? '',
      operation_zone: this.form.value.operation_zone ?? '',
      status: (this.form.value.status ?? 'active') as 'active' | 'inactive',
      logo_file: this.form.value.logo_file ?? null
    };

    this.saved.emit(payload);
  }
}
