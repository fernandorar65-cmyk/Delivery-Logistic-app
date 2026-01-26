import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { StorageService } from '@app/core/storage/storage.service';
import { LocalStorageEnums } from '@app/shared/models/local.storage.enums';
import { HeroIconComponent } from '@app/shared/ui/hero-icon/hero-icon';
import { ModalComponent } from '@app/shared/ui/modal/modal.component';
import { StatusGroup, StatusGroupState, StatusGroupStateCreate } from '@app/features/companies/models/status-group.model';
import { StatusGroupsService } from '@app/features/companies/services/status-groups.service';

type StatusStep = {
  label: string;
  tone: 'green' | 'blue' | 'amber' | 'indigo' | 'cyan' | 'orange' | 'gray';
  color?: string;
};

@Component({
  selector: 'app-company-status-group-detail-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, HeroIconComponent, ModalComponent],
  templateUrl: './company-status-group-detail-view.component.html',
  styleUrl: './company-status-group-detail-view.component.css'
})
export class CompanyStatusGroupDetailViewComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private statusGroupsService = inject(StatusGroupsService);
  private storageService = inject(StorageService);
  private fb = inject(FormBuilder);

  loading = signal(false);
  error = signal<string | null>(null);
  group = signal<StatusGroup | null>(null);
  steps = signal<StatusStep[]>([]);
  createOpen = signal(false);
  createLoading = signal(false);
  createError = signal<string | null>(null);
  colorOpen = signal(false);
  colorLoading = signal(false);
  colorError = signal<string | null>(null);

  private groupId: string | null = null;
  private colorIndex: number | null = null;

  private readonly toneHex: Record<StatusStep['tone'], string> = {
    green: '#16a34a',
    blue: '#2563eb',
    amber: '#f59e0b',
    indigo: '#6366f1',
    cyan: '#06b6d4',
    orange: '#f97316',
    gray: '#94a3b8'
  };

  readonly colorOptions: Array<{ label: string; hex: string; tone: StatusStep['tone'] }> = [
    { label: 'Green', hex: '#16a34a', tone: 'green' },
    { label: 'Cyan', hex: '#06b6d4', tone: 'cyan' },
    { label: 'Orange', hex: '#f97316', tone: 'orange' },
    { label: 'Indigo', hex: '#6366f1', tone: 'indigo' },
    { label: 'Blue', hex: '#2563eb', tone: 'blue' },
    { label: 'Amber', hex: '#f59e0b', tone: 'amber' },
    { label: 'Gray', hex: '#94a3b8', tone: 'gray' }
  ];

  createStateForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    code: ['', [Validators.required, Validators.minLength(2)]],
    order: [1, [Validators.required, Validators.min(1)]],
    is_initial: [false, [Validators.required]],
    is_final: [false, [Validators.required]],
    is_visible_to_client: [true, [Validators.required]],
    is_visible_to_provider: [true, [Validators.required]]
  });

  private readonly statusTemplates: StatusStep[][] = [
    [
      { label: 'Pendiente de recogida', tone: 'amber' },
      { label: 'En almacén', tone: 'blue' },
      { label: 'En tránsito', tone: 'cyan' },
      { label: 'Entregado', tone: 'green' }
    ],
    [
      { label: 'Recogido', tone: 'green' },
      { label: 'Control de temperatura', tone: 'cyan' },
      { label: 'Despacho prioritario', tone: 'orange' },
      { label: 'Última milla', tone: 'indigo' }
    ],
    [
      { label: 'Recepción', tone: 'blue' },
      { label: 'Clasificación', tone: 'amber' },
      { label: 'Transporte principal', tone: 'indigo' },
      { label: 'Entrega final', tone: 'green' }
    ]
  ];

  ngOnInit(): void {
    this.groupId = this.route.snapshot.paramMap.get('groupId');
    if (!this.groupId) {
      this.error.set('No se pudo identificar el grupo.');
      return;
    }
    this.loadGroup(this.groupId);
    this.loadStatuses(this.groupId);
  }

  getToneClass(tone: StatusStep['tone']): string {
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

  get pageTitle(): string {
    return this.group()?.name ?? 'Detalle del grupo';
  }

  get pageSubtitle(): string {
    const company = this.group()?.company_name;
    return company
      ? `Detalle del flujo asociado a ${company}.`
      : 'Detalle del flujo de estados configurado.';
  }

  formatDate(value?: string): string {
    if (!value) return 'Sin fecha';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Sin fecha';
    return date.toLocaleDateString('es-PE', { year: 'numeric', month: 'short', day: '2-digit' });
  }

  openCreateState(): void {
    this.createError.set(null);
    this.createStateForm.reset({
      name: '',
      code: '',
      order: Math.max(this.steps().length + 1, 1),
      is_initial: false,
      is_final: false,
      is_visible_to_client: true,
      is_visible_to_provider: true
    });
    this.createOpen.set(true);
  }

  closeCreateState(): void {
    this.createOpen.set(false);
    this.createError.set(null);
  }

  openColorPicker(index: number): void {
    this.colorError.set(null);
    this.colorIndex = index;
    this.colorOpen.set(true);
  }

  closeColorPicker(): void {
    this.colorOpen.set(false);
    this.colorError.set(null);
    this.colorIndex = null;
  }

  applyColor(option: { label: string; hex: string; tone: StatusStep['tone'] }): void {
    if (this.colorIndex === null) return;
    this.steps.update((items) => items.map((step, idx) => {
      if (idx !== this.colorIndex) return step;
      return { ...step, color: option.hex, tone: option.tone };
    }));
    this.closeColorPicker();
  }

  removeStep(index: number): void {
    this.steps.update((items) => items.filter((_, idx) => idx !== index));
    const current = this.group();
    if (current) {
      const updated = {
        ...current,
        statuses_count: Math.max((current.statuses_count ?? 0) - 1, 0)
      };
      this.group.set(updated);
    }
  }

  getStepColor(step: StatusStep): string {
    return step.color ?? this.toneHex[step.tone];
  }

  submitCreateState(): void {
    if (this.createStateForm.invalid) {
      this.createStateForm.markAllAsTouched();
      return;
    }
    if (!this.groupId) {
      this.createError.set('No se pudo identificar el grupo.');
      return;
    }

    this.createLoading.set(true);
    this.createError.set(null);

    const payload = this.createStateForm.getRawValue() as StatusGroupStateCreate;
    this.statusGroupsService.createStatus(this.groupId, payload)
      .pipe(finalize(() => this.createLoading.set(false)))
      .subscribe({
        next: (response) => {
          if (response?.errors?.length) {
            this.createError.set('No se pudo crear el estado.');
            return;
          }
          this.closeCreateState();
          this.appendStep(payload);
          const current = this.group();
          if (current) {
            const updated = {
              ...current,
              statuses_count: (current.statuses_count ?? 0) + 1
            };
            this.group.set(updated);
          }
        },
        error: () => {
          this.createError.set('No se pudo crear el estado.');
        }
      });
  }

  private loadGroup(groupId: string): void {
    const companyId = this.storageService.getItem(LocalStorageEnums.ID);
    if (!companyId) {
      this.error.set('No se pudo identificar la compañía.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.statusGroupsService.getById(companyId, groupId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          if (response?.errors?.length) {
            this.error.set('No se pudo cargar el grupo.');
            return;
          }
          const result = response?.result ?? null;
          this.group.set(result);
          this.steps.set(result ? this.getTemplateFor(result.id ?? groupId) : []);
        },
        error: () => {
          this.error.set('No se pudo cargar el grupo.');
        }
      });
  }

  private loadStatuses(groupId: string): void {
    this.statusGroupsService.listStatuses(groupId)
      .subscribe({
        next: (response) => {
          if (response?.errors?.length) {
            return;
          }
          const items = Array.isArray(response?.result) ? response.result : [];
          if (items.length === 0) {
            this.steps.set(this.getTemplateFor(groupId));
            return;
          }
          const mapped = items
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            .map((item) => this.mapStateToStep(item));
          this.steps.set(mapped);
        },
        error: () => {
          // fallback to template to keep UI filled
          this.steps.set(this.getTemplateFor(groupId));
        }
      });
  }

  private getTemplateFor(groupId: string): StatusStep[] {
    const index = this.getTemplateIndex(groupId);
    return this.statusTemplates[index] ?? [];
  }

  private getTemplateIndex(groupId: string): number {
    const sum = Array.from(groupId).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return this.statusTemplates.length > 0 ? sum % this.statusTemplates.length : 0;
  }

  private appendStep(payload: StatusGroupStateCreate): void {
    const tone = this.getToneFromFlags(payload);
    const color = this.toneHex[tone];
    this.steps.update((items) => [
      ...items,
      { label: payload.name, tone, color }
    ]);
  }

  private getToneFromFlags(payload: StatusGroupStateCreate): StatusStep['tone'] {
    if (payload.is_final) return 'green';
    if (payload.is_initial) return 'amber';
    return 'blue';
  }

  private mapStateToStep(state: StatusGroupState): StatusStep {
    const tone = state.is_final
      ? 'green'
      : state.is_initial
        ? 'amber'
        : 'blue';
    return {
      label: state.name ?? 'Estado sin nombre',
      tone,
      color: this.toneHex[tone]
    };
  }
}
