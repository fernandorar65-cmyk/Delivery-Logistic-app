import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { StorageService } from '@app/core/storage/storage.service';
import { LocalStorageEnums } from '@app/shared/models/local.storage.enums';
import { HeroIconComponent } from '@app/shared/ui/hero-icon/hero-icon';
import { StatusGroup } from '@app/features/companies/models/status-group.model';
import { StatusGroupsService } from '@app/features/companies/services/status-groups.service';

type StatusStep = {
  label: string;
  tone: 'green' | 'blue' | 'amber' | 'indigo' | 'cyan' | 'orange' | 'gray';
};

@Component({
  selector: 'app-company-status-group-detail-view',
  standalone: true,
  imports: [CommonModule, RouterLink, HeroIconComponent],
  templateUrl: './company-status-group-detail-view.component.html',
  styleUrl: './company-status-group-detail-view.component.css'
})
export class CompanyStatusGroupDetailViewComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private statusGroupsService = inject(StatusGroupsService);
  private storageService = inject(StorageService);

  loading = signal(false);
  error = signal<string | null>(null);
  group = signal<StatusGroup | null>(null);
  steps = signal<StatusStep[]>([]);

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
    const groupId = this.route.snapshot.paramMap.get('groupId');
    if (!groupId) {
      this.error.set('No se pudo identificar el grupo.');
      return;
    }
    this.loadGroup(groupId);
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

  private getTemplateFor(groupId: string): StatusStep[] {
    const index = this.getTemplateIndex(groupId);
    return this.statusTemplates[index] ?? [];
  }

  private getTemplateIndex(groupId: string): number {
    const sum = Array.from(groupId).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return this.statusTemplates.length > 0 ? sum % this.statusTemplates.length : 0;
  }
}
