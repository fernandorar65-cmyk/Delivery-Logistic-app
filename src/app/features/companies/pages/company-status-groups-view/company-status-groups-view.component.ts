import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { HeroIconComponent } from '@app/shared/ui/hero-icon/hero-icon';
import { ModalComponent } from '@app/shared/ui/modal/modal.component';
import { StatusGroupsService } from '@app/features/companies/services/status-groups.service';
import { StorageService } from '@app/core/storage/storage.service';
import { LocalStorageEnums } from '@app/shared/models/local.storage.enums';
import { StatusGroup } from '@app/features/companies/models/status-group.model';

type StatusTag = {
  label: string;
  tone: 'green' | 'blue' | 'amber' | 'indigo' | 'cyan' | 'orange' | 'gray';
};

type StatusGroupView = {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconTone: 'primary' | 'purple' | 'orange';
  statuses: StatusTag[];
  shipments: string;
  updatedAt: string;
  members: string[];
};

@Component({
  selector: 'app-company-status-groups-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HeroIconComponent, ModalComponent],
  templateUrl: './company-status-groups-view.component.html',
  styleUrl: './company-status-groups-view.component.css'
})
export class CompanyStatusGroupsViewComponent implements OnInit {
  private fb = inject(FormBuilder);
  private statusGroupsService = inject(StatusGroupsService);
  private storageService = inject(StorageService);

  loading = signal(false);
  error = signal<string | null>(null);
  createOpen = signal(false);
  createLoading = signal(false);
  createError = signal<string | null>(null);
  editOpen = signal(false);
  editLoading = signal(false);
  editError = signal<string | null>(null);
  editingGroupId = signal<string | null>(null);

  createForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]]
  });

  editForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]]
  });

  groups: StatusGroupView[] = [];
  totalCount = signal(0);

  private readonly statusTemplates: StatusTag[][] = [
    [
      { label: 'Recogido', tone: 'green' },
      { label: 'En Almacén', tone: 'blue' },
      { label: 'En Tránsito', tone: 'amber' },
      { label: 'Entregado', tone: 'indigo' }
    ],
    [
      { label: 'Recogido', tone: 'green' },
      { label: 'Control Temp OK', tone: 'cyan' },
      { label: 'Despacho Prioritario', tone: 'amber' },
      { label: 'Última Milla', tone: 'orange' },
      { label: 'Entregado', tone: 'indigo' }
    ],
    [
      { label: 'Origen', tone: 'gray' },
      { label: 'Trámites Aduana', tone: 'orange' },
      { label: 'En Tránsito Marítimo', tone: 'blue' },
      { label: 'Entregado', tone: 'indigo' }
    ]
  ];

  ngOnInit(): void {
    this.loadGroups();
  }

  getToneClass(tone: StatusTag['tone']): string {
    switch (tone) {
      case 'green':
        return 'tag tag-green';
      case 'blue':
        return 'tag tag-blue';
      case 'amber':
        return 'tag tag-amber';
      case 'indigo':
        return 'tag tag-indigo';
      case 'cyan':
        return 'tag tag-cyan';
      case 'orange':
        return 'tag tag-orange';
      default:
        return 'tag tag-gray';
    }
  }

  getIconToneClass(tone: StatusGroupView['iconTone']): string {
    switch (tone) {
      case 'purple':
        return 'icon-badge icon-purple';
      case 'orange':
        return 'icon-badge icon-orange';
      default:
        return 'icon-badge icon-primary';
    }
  }

  openCreateModal(): void {
    this.createError.set(null);
    this.createForm.reset();
    this.createOpen.set(true);
  }

  closeCreateModal(): void {
    this.createOpen.set(false);
    this.createError.set(null);
  }

  openEditModal(group: StatusGroupView): void {
    this.editError.set(null);
    this.editingGroupId.set(group.id);
    this.editForm.reset({ name: group.title });
    this.editOpen.set(true);
  }

  closeEditModal(): void {
    this.editOpen.set(false);
    this.editError.set(null);
    this.editingGroupId.set(null);
  }

  submitCreate(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    const companyId = this.storageService.getItem(LocalStorageEnums.ID);
    if (!companyId) {
      this.createError.set('No se pudo identificar la compañía.');
      return;
    }

    this.createLoading.set(true);
    this.createError.set(null);

    const name = this.createForm.getRawValue().name ?? '';
    this.statusGroupsService.create(companyId, { name })
      .pipe(finalize(() => this.createLoading.set(false)))
      .subscribe({
        next: (response) => {
          if (response.errors && response.errors.length > 0) {
            this.createError.set('No se pudo crear el grupo.');
            return;
          }
          this.closeCreateModal();
          this.loadGroups();
        },
        error: () => {
          this.createError.set('No se pudo crear el grupo.');
        }
      });
  }

  submitEdit(): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    const companyId = this.storageService.getItem(LocalStorageEnums.ID);
    const groupId = this.editingGroupId();
    if (!companyId || !groupId) {
      this.editError.set('No se pudo identificar el grupo.');
      return;
    }

    this.editLoading.set(true);
    this.editError.set(null);

    const name = this.editForm.getRawValue().name ?? '';
    this.statusGroupsService.update(companyId, groupId, { name })
      .pipe(finalize(() => this.editLoading.set(false)))
      .subscribe({
        next: (response) => {
          if (response.errors && response.errors.length > 0) {
            this.editError.set('No se pudo actualizar el grupo.');
            return;
          }
          this.closeEditModal();
          this.loadGroups();
        },
        error: () => {
          this.editError.set('No se pudo actualizar el grupo.');
        }
      });
  }

  private loadGroups(): void {
    const companyId = this.storageService.getItem(LocalStorageEnums.ID);
    if (!companyId) {
      this.error.set('No se pudo identificar la compañía.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.statusGroupsService.list(companyId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          if (response.errors && response.errors.length > 0) {
            this.error.set('No se pudieron cargar los grupos.');
            return;
          }
          const results = response.result ?? [];
          this.totalCount.set(response.pagination?.count ?? results.length);
          this.groups = results.map((group, index) => this.mapToViewModel(group, index));
        },
        error: () => {
          this.error.set('No se pudieron cargar los grupos.');
        }
      });
  }

  private mapToViewModel(group: StatusGroup, index: number): StatusGroupView {
    const template = this.statusTemplates[index % this.statusTemplates.length] ?? [];
    return {
      id: group.id ?? `${index}`,
      title: group.name ?? 'Grupo sin nombre',
      description: group.company_name
        ? `Flujo personalizado para ${group.company_name}.`
        : 'Flujo personalizado para su operación logística.',
      icon: index % 3 === 1 ? 'bolt' : index % 3 === 2 ? 'chart-bar' : 'truck',
      iconTone: index % 3 === 1 ? 'purple' : index % 3 === 2 ? 'orange' : 'primary',
      statuses: template,
      shipments: String(group.statuses_count ?? 0),
      updatedAt: this.formatDate(group.updated_at ?? group.created_at),
      members: ['GL']
    };
  }

  private formatDate(value?: string): string {
    if (!value) return 'Sin fecha';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Sin fecha';
    return date.toLocaleDateString('es-PE', { year: 'numeric', month: 'short', day: '2-digit' });
  }
}
