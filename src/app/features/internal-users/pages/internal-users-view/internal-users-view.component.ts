import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, OnInit, computed, inject, signal, PLATFORM_ID } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import {
  InternalUser,
  InternalUserCreate,
  InternalUserOwnerType
} from '@app/features/internal-users/models/internal-user.model';
import { InternalUsersService } from '@app/features/internal-users/services/internal-users.service';
import { EmptyStateComponent } from '@app/shared/ui/empty-state/empty-state.component';
import { LoadingCardComponent } from '@app/shared/ui/loading-card/loading-card.component';
import { ModalComponent } from '@app/shared/ui/modal/modal.component';
import { HeroIconComponent } from '@app/shared/ui/hero-icon/hero-icon';
import { StorageService } from '@app/core/storage/storage.service';
import { LocalStorageEnums } from '@app/shared/models/local.storage.enums';

@Component({
  selector: 'app-internal-users-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, EmptyStateComponent, LoadingCardComponent, ModalComponent, HeroIconComponent],
  templateUrl: './internal-users-view.component.html',
  styleUrl: './internal-users-view.component.css'
})
export class InternalUsersViewComponent implements OnInit {
  private usersService = inject(InternalUsersService);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private storageService = inject(StorageService);
  private platformId = inject(PLATFORM_ID);

  loading = signal(false);
  error = signal<string | null>(null);
  users = signal<InternalUser[]>([]);

  modalOpen = signal(false);
  formLoading = signal(false);
  formError = signal<string | null>(null);

  ownerId = signal<string | null>(null);
  ownerType = signal<InternalUserOwnerType>('company');

  ownerLabel = computed(() => {
    switch (this.ownerType()) {
      case 'company':
        return 'Compañía';
      case 'provider':
        return 'Proveedor';
      case 'client':
        return 'Cliente';
      default:
        return 'Entidad';
    }
  });

  userForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    first_name: [''],
    last_name: [''],
    password: ['', Validators.required]
  });

  ngOnInit(): void {
    const ownerType = this.route.snapshot.data['ownerType'] as InternalUserOwnerType | undefined;

    if (ownerType) {
      this.ownerType.set(ownerType);
    }

    this.resolveOwnerId();

    const resolvedOwnerId = this.ownerId();
    if (!resolvedOwnerId || resolvedOwnerId === 'null') {
      this.error.set('No se pudo identificar la entidad.');
      return;
    }

    this.loadUsers();
  }

  private loadOwnerIdFromStorage(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const entityId = this.storageService.getItem(LocalStorageEnums.ID);
    if (entityId) {
      this.ownerId.set(entityId);
    }
  }

  private resolveOwnerId(): void {
    const ownerId = this.route.snapshot.paramMap.get('id');
    if (ownerId && ownerId !== 'null') {
      this.ownerId.set(ownerId);
      return;
    }
    this.loadOwnerIdFromStorage();
  }

  loadUsers(): void {
    const ownerId = this.ownerId();
    const ownerType = this.ownerType();
    if (!ownerId) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.usersService.list(ownerType, ownerId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          if (response.errors && response.errors.length > 0) {
            this.error.set(this.formatApiErrors(response.errors));
            return;
          }
          const result = response.result;
          this.users.set(Array.isArray(result) ? result : []);
        },
        error: (err) => {
          this.error.set(this.formatApiErrors(err?.error?.errors ?? err?.errors ?? err?.message));
        }
      });
  }

  openCreate(): void {
    this.formError.set(null);
    this.userForm.reset();
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.get('password')?.updateValueAndValidity();
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
    this.formError.set(null);
  }

  submit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const ownerId = this.ownerId();
    const ownerType = this.ownerType();
    if (!ownerId) {
      this.formError.set('No se pudo identificar la entidad.');
      return;
    }

    const formValue = this.userForm.getRawValue();
    const payloadBase = {
      email: formValue.email ?? '',
      first_name: formValue.first_name ?? '',
      last_name: formValue.last_name ?? ''
    };

    this.formLoading.set(true);
    this.formError.set(null);

    const createPayload: InternalUserCreate = {
      ...payloadBase,
      password: formValue.password ?? ''
    };

    this.usersService.create(ownerType, ownerId, createPayload)
      .pipe(finalize(() => this.formLoading.set(false)))
      .subscribe({
        next: (response) => {
          if (response.errors && response.errors.length > 0) {
            this.formError.set(this.formatApiErrors(response.errors));
            return;
          }
          this.modalOpen.set(false);
          this.loadUsers();
        },
        error: (err) => {
          this.formError.set(this.formatApiErrors(err?.error?.errors ?? err?.errors ?? err?.message));
        }
      });
  }

  remove(user: InternalUser): void {
    const ownerId = this.ownerId();
    const ownerType = this.ownerType();
    if (!ownerId || !user.id) {
      return;
    }

    const confirmed = confirm('¿Seguro que deseas eliminar este usuario interno?');
    if (!confirmed) {
      return;
    }

    this.usersService.remove(ownerType, ownerId, String(user.id))
      .subscribe({
        next: () => {
          this.users.update(items => items.filter(item => item.id !== user.id));
        },
        error: (err) => {
          this.error.set(this.formatApiErrors(err?.error?.errors ?? err?.errors ?? err?.message));
        }
      });
  }

  private formatApiErrors(errors: unknown): string {
    if (Array.isArray(errors)) {
      return errors.filter(Boolean).join(' ');
    }
    if (typeof errors === 'string') {
      return errors;
    }
    return 'Ocurrió un error al procesar la solicitud.';
  }

  getUserDisplayName(user: InternalUser): string {
    const firstName = user.user?.first_name ?? user.first_name ?? '';
    const lastName = user.user?.last_name ?? user.last_name ?? '';
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || this.getUserEmail(user);
  }

  getUserEmail(user: InternalUser): string {
    return user.user?.email ?? user.email ?? '';
  }

  getUserCreatedAtDisplay(user: InternalUser): string {
    const rawDate = user.user?.created_at ?? user.created_at;
    return this.formatDate(rawDate);
  }

  getFieldError(fieldName: string): string {
    const field = this.userForm.get(fieldName);
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

  private formatDate(value?: string): string {
    if (!value) {
      return '—';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '—';
    }
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    const hours = `${date.getHours()}`.padStart(2, '0');
    const minutes = `${date.getMinutes()}`.padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  }
}
