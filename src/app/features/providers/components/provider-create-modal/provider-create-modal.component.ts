import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, finalize, of, switchMap } from 'rxjs';
import { ProviderService } from '@app/features/providers/services/provider.service';
import { StorageService } from '@app/core/storage/storage.service';
import { ProviderCheckResponse, ProviderCreate, ProviderResponse } from '@app/features/providers/models/provider.model';
import { CompanyProviderMatchResponse } from '@app/features/providers/models/company-provider-match.model';
import { LocalStorageEnums } from '@app/shared/models/local.storage.enums';
import { ModalComponent } from '@app/shared/ui/modal/modal.component';

@Component({
  selector: 'app-provider-create-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent],
  templateUrl: './provider-create-modal.component.html',
  styleUrl: './provider-create-modal.component.css'
})
export class ProviderCreateModalComponent {
  private fb = inject(FormBuilder);
  private providerService = inject(ProviderService);
  private storageService = inject(StorageService);

  @Input() open = false;
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<ProviderCreate>();

  checkLoading = signal(false);
  checkError = signal<string | null>(null);
  checkSuccess = signal<string | null>(null);
  emailStatus = signal<'idle' | 'checking' | 'unique' | 'exists' | 'error'>('idle');
  matchModalOpen = signal(false);
  matchEmail = signal<string | null>(null);
  matchProviderId = signal<string | null>(null);
  matchLoading = signal(false);
  matchError = signal<string | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  form = this.fb.group({
    company_name: ['', [Validators.required, Validators.minLength(2)]],
    ruc: ['', [Validators.required, Validators.minLength(6)]],
    contact_email: ['', [Validators.required, Validators.email]],
    description: [''],
    password: ['', [Validators.required, Validators.minLength(6)]]
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
    this.checkSuccess.set(null);
    this.emailStatus.set('checking');
    this.checkLoading.set(true);
    this.providerService.checkProviderEmail(emailValue).pipe(
      catchError((err) => {
        if (err?.status === 404) {
          this.emailStatus.set('unique');
          this.checkError.set(null);
          this.checkSuccess.set('Correo disponible.');
          return of<ProviderCheckResponse>({ errors: [], result: null });
        }
        if (err?.status === 400) {
          this.emailStatus.set('error');
          this.checkError.set('El correo existe, pero no pertenece a un provider.');
          this.checkSuccess.set(null);
          return of(null);
        }
        this.emailStatus.set('error');
        this.checkError.set('No se pudo verificar el correo.');
        this.checkSuccess.set(null);
        return of(null);
      }),
      finalize(() => this.checkLoading.set(false))
    ).subscribe((response: ProviderCheckResponse | null) => {
      if (!response) return;
      if (response.errors && response.errors.length > 0) {
        this.emailStatus.set('error');
        this.checkError.set('No se pudo verificar el correo.');
        this.checkSuccess.set(null);
        return;
      }
      const exists = Boolean(response.result?.id);
      if (exists) {
        this.emailStatus.set('exists');
        this.matchEmail.set(response.result?.user_email || emailValue);
        this.matchProviderId.set(response.result?.id || null);
        this.matchError.set(null);
        this.checkSuccess.set(null);
        this.matchModalOpen.set(true);
        return;
      }
      this.emailStatus.set('unique');
      this.checkError.set(null);
      this.checkSuccess.set('Correo disponible.');
    });
  }

  close(): void {
    this.closed.emit();
  }

  closeMatchModal(): void {
    this.matchModalOpen.set(false);
    this.matchEmail.set(null);
    this.matchProviderId.set(null);
    this.matchError.set(null);
  }

  confirmMatchRequest(): void {
    const providerId = this.matchProviderId();
    const companyId = this.storageService.getItem(LocalStorageEnums.ID);
    if (!companyId || !providerId) {
      this.matchError.set('No se pudo enviar la solicitud. Falta información.');
      return;
    }
    this.matchLoading.set(true);
    this.matchError.set(null);
    this.providerService.sendCompanyProviderRequest({
      company_id: companyId,
      provider_id: providerId
    }).pipe(
      finalize(() => this.matchLoading.set(false))
    ).subscribe({
      next: (response: CompanyProviderMatchResponse) => {
        if (response.errors && response.errors.length > 0) {
          this.matchError.set('No se pudo enviar la solicitud. Intenta nuevamente.');
          return;
        }
        this.closeMatchModal();
      },
      error: () => {
        this.matchError.set('No se pudo enviar la solicitud. Intenta nuevamente.');
      }
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.checkError.set(null);
    this.checkSuccess.set(null);
    const payload: ProviderCreate = {
      provider_name: this.form.value.company_name ?? '',
      ruc: this.form.value.ruc ?? '',
      description: this.form.value.description || undefined,
      email: this.form.value.contact_email ?? '',
      password: this.form.value.password ?? ''
    };

    if (this.emailStatus() === 'exists') {
      this.matchEmail.set(payload.email);
      this.matchModalOpen.set(true);
      return;
    }
    if (this.emailStatus() === 'checking') {
      this.checkError.set('Espera a que termine la verificación del correo.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.providerService.create(payload).pipe(
      switchMap((response: ProviderResponse) => {
        if (response.errors && response.errors.length > 0) {
          this.error.set('Error al crear el aliado. Por favor, intenta nuevamente.');
          return of(null);
        }
        const companyId = this.storageService.getItem(LocalStorageEnums.ID);
        const providerId = response?.result?.id;

        if (!companyId || !providerId) {
          this.error.set('Aliado creado, pero no se pudo enviar la solicitud de match.');
          return of(null);
        }

        return this.providerService.sendCompanyProviderRequest({
          company_id: companyId,
          provider_id: providerId
        }).pipe(
          switchMap((matchResponse) => {
            if (matchResponse?.errors && matchResponse.errors.length > 0) {
              this.error.set('Aliado creado, pero no se pudo enviar la solicitud de match.');
              return of(null);
            }
            return of(matchResponse);
          }),
          catchError(() => {
            this.error.set('Aliado creado, pero no se pudo enviar la solicitud de match.');
            return of(null);
          })
        );
      }),
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: () => {
        this.close();
        this.saved.emit(payload);
      },
      error: () => {
        this.error.set('Error al crear el aliado. Por favor, intenta nuevamente.');
      }
    });
  }
}






