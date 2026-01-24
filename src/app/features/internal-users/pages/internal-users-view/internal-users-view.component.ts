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
import { StorageService } from '@app/core/storage/storage.service';
import { LocalStorageEnums } from '@app/shared/models/local.storage.enums';

@Component({
  selector: 'app-internal-users-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, EmptyStateComponent, LoadingCardComponent, ModalComponent],
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
    const ownerId = this.route.snapshot.paramMap.get('id');
    const ownerType = this.route.snapshot.data['ownerType'] as InternalUserOwnerType | undefined;

    if (ownerId) {
      this.ownerId.set(ownerId);
    }
    if (ownerType) {
      this.ownerType.set(ownerType);
    }

    if (!ownerId) {
      this.loadOwnerIdFromStorage();
    }

    if (this.ownerType() !== 'provider') {
      this.error.set('Esta sección solo está disponible para providers.');
      return;
    }

    if (!this.ownerId()) {
      this.error.set('No se pudo identificar la entidad.');
      return;
    }

    this.loadUsers();
  }

  private loadOwnerIdFromStorage(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (this.ownerType() === 'provider') {
      const providerId = this.storageService.getItem(LocalStorageEnums.USER_ID);
      if (providerId) {
        this.ownerId.set(providerId);
        return;
      }
    }

    const userId = this.storageService.getItem(LocalStorageEnums.USER_ID);
    if (userId) {
      this.ownerId.set(userId);
    }
  }

  loadUsers(): void {
    const ownerId = this.ownerId();
    if (!ownerId) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.usersService.list(ownerId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          if (response.errors && response.errors.length > 0) {
            this.error.set('No se pudieron cargar los usuarios internos.');
            return;
          }
          this.users.set(response.result ?? []);
        },
        error: () => {
          this.error.set('No se pudieron cargar los usuarios internos.');
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

    this.usersService.create(ownerId, createPayload)
      .pipe(finalize(() => this.formLoading.set(false)))
      .subscribe({
        next: (response) => {
          if (response.errors && response.errors.length > 0) {
            this.formError.set('No se pudo crear el usuario interno.');
            return;
          }
          this.modalOpen.set(false);
          this.loadUsers();
        },
        error: () => {
          this.formError.set('No se pudo crear el usuario interno.');
        }
      });
  }

  remove(user: InternalUser): void {
    const ownerId = this.ownerId();
    if (!ownerId || !user.id) {
      return;
    }

    const confirmed = confirm('¿Seguro que deseas eliminar este usuario interno?');
    if (!confirmed) {
      return;
    }

    this.usersService.remove(ownerId, String(user.id))
      .subscribe({
        next: () => {
          this.users.update(items => items.filter(item => item.id !== user.id));
        },
        error: () => {
          this.error.set('No se pudo eliminar el usuario interno.');
        }
      });
  }

  getUserDisplayName(user: InternalUser): string {
    const fullName = `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim();
    return fullName || user.email;
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
}
