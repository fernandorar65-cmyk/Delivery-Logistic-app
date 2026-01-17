import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, finalize, of } from 'rxjs';
import { ProviderService } from '../../../services/provider.service';

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
  private providerService = inject(ProviderService);

  @Input() open = false;
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<ProviderCreatePayload>();
  @Output() requestMatch = new EventEmitter<string>();

  checkLoading = signal(false);
  checkError = signal<string | null>(null);
  emailStatus = signal<'idle' | 'checking' | 'unique' | 'exists' | 'error'>('idle');
  matchModalOpen = signal(false);
  matchEmail = signal<string | null>(null);

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

  verifyEmail(): void {
    const emailValue = (this.form.value.contact_email ?? '').toString().trim().toLowerCase();
    if (!emailValue) {
      this.emailStatus.set('idle');
      return;
    }
    if (this.form.get('contact_email')?.invalid) {
      this.emailStatus.set('idle');
      this.checkError.set('Ingresa un correo válido para verificar.');
      return;
    }

    this.checkError.set(null);
    this.emailStatus.set('checking');
    this.checkLoading.set(true);
    this.providerService.checkProviderEmail(emailValue).pipe(
      catchError(() => {
        this.emailStatus.set('error');
        this.checkError.set('No se pudo verificar el correo.');
        return of(null);
      }),
      finalize(() => this.checkLoading.set(false))
    ).subscribe((response: any) => {
      if (!response) return;
      const exists = Boolean(response?.result?.id);
      if (exists) {
        this.emailStatus.set('exists');
        this.matchEmail.set(response?.result?.user_email || emailValue);
        this.matchModalOpen.set(true);
        return;
      }
      this.emailStatus.set('unique');
    });
  }

  close(): void {
    this.closed.emit();
  }

  closeMatchModal(): void {
    this.matchModalOpen.set(false);
    this.matchEmail.set(null);
  }

  confirmMatchRequest(): void {
    const email = this.matchEmail();
    if (email) {
      this.requestMatch.emit(email);
    }
    this.closeMatchModal();
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

    this.checkError.set(null);
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

    if (this.emailStatus() === 'exists') {
      this.matchEmail.set(payload.contact_email);
      this.matchModalOpen.set(true);
      return;
    }
    if (this.emailStatus() === 'checking') {
      this.checkError.set('Espera a que termine la verificación del correo.');
      return;
    }
    this.saved.emit(payload);
  }
}
