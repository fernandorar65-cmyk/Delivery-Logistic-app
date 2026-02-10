import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, signal } from '@angular/core';
import * as XLSX from 'xlsx';
import { ImportsService } from '@app/features/clients/services/imports.service';
import { StorageService } from '@app/core/storage/storage.service';
import { LocalStorageEnums } from '@app/shared/models/local.storage.enums';
import { ImportMappingDetectResponse } from '@app/features/clients/models/imports.model';

type SectionConfig = {
  id: string;
  label: string;
  headers: string[];
};

@Component({
  selector: 'app-client-shipments-upload-v2-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './client-shipments-upload-v2-view.component.html',
  styleUrl: './client-shipments-upload-v2-view.component.css'
})
export class ClientShipmentsUploadV2ViewComponent {
  private importsService = inject(ImportsService);
  private storageService = inject(StorageService);

  openSelectId = signal<string | null>(null);
  currentStep = signal(0);
  readonly defaultSteps = [
    { id: 'order', label: 'Datos de Contacto Recogo' },
    { id: 'receiver', label: 'Datos de Entrega' },
    { id: 'logistics', label: 'Paquete' }
  ];
  sections = signal<SectionConfig[]>([]);
  steps = signal<{ id: string; label: string }[]>(this.defaultSteps);
  readonly fallbackHeaders = ['order_ref_id', 'order_date_created', 'service_type_name'];
  readonly fieldOptions = [
    'ID de Pedido (Sistema)',
    'Referencia Externa',
    'SKU',
    'Fecha de Creación',
    'Fecha de Entrega',
    'Tipo de Servicio',
    'Categoría de Envío',
    'Omitir esta columna'
  ];
  selectedLabels = signal<Record<string, string>>({
    order_ref_id: 'ID de Pedido (Sistema)',
    order_date_created: 'Fecha de Creación',
    service_type_name: 'Tipo de Servicio'
  });
  excelHeaders = signal<string[]>([]);
  excelSamples = signal<Record<string, string>>({});
  excelFileName = signal<string | null>(null);
  excelError = signal<string | null>(null);
  templateResult = signal<ImportMappingDetectResponse['result'] | null>(null);
  templateError = signal<string | null>(null);

  resetFileInput(input: HTMLInputElement): void {
    input.value = '';
  }

  onExcelFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0];
    if (!file) {
      return;
    }

    this.excelError.set(null);
    this.excelFileName.set(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = new Uint8Array(reader.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' }) as string[][];
        const sectionRowIndex = this.getSectionRowIndex(worksheet);
        const headerRowIndex = sectionRowIndex + 1;
        const headerRow = rows?.[headerRowIndex] ?? [];
        const headers = headerRow
          .map((value) => String(value).trim())
          .filter((value) => Boolean(value));
        const sampleRow = rows?.[headerRowIndex + 1] ?? [];
        const samples = headers.reduce<Record<string, string>>((acc, header, index) => {
          acc[header] = String(sampleRow[index] ?? '').trim() || 'Sin ejemplo';
          return acc;
        }, {});
        this.excelHeaders.set(headers);
        this.excelSamples.set(samples);
        this.detectTemplate(headers);
        this.sections.set(this.buildSections(worksheet, headers, sectionRowIndex));
        this.steps.set(this.sections().length
          ? this.sections().map((section, index) => ({
            id: section.id || `section-${index + 1}`,
            label: section.label
          }))
          : this.defaultSteps);
        if (this.currentStep() >= this.steps().length) {
          this.currentStep.set(0);
        }
        this.selectedLabels.update((current) => {
          const next = { ...current };
          headers.forEach((header) => {
            if (!next[header]) {
              next[header] = 'Omitir esta columna';
            }
          });
          return next;
        });
      } catch (error) {
        this.excelError.set('No se pudo leer el archivo. Verifica el formato.');
      }
    };
    reader.onerror = () => {
      this.excelError.set('No se pudo leer el archivo. Intenta nuevamente.');
    };
    reader.readAsArrayBuffer(file);
  }

  private detectTemplate(headers: string[]): void {
    const clientId = this.storageService.getItem(LocalStorageEnums.ID);
    if (!clientId || !headers.length) {
      return;
    }
    this.templateError.set(null);
    this.importsService.detectMapping({ client_id: clientId, headers }).subscribe({
      next: (response) => {
        this.templateResult.set(response?.result ?? null);
      },
      error: () => {
        this.templateError.set('No se pudo validar el template.');
      }
    });
  }

  getSample(header: string): string {
    return this.excelSamples()[header] ?? 'Sin ejemplo';
  }

  isDangerOption(option: string): boolean {
    return option.toLowerCase().includes('omitir');
  }

  setStep(index: number): void {
    if (index < 0 || index >= this.steps().length) {
      return;
    }
    this.currentStep.set(index);
  }

  nextStep(): void {
    this.setStep(this.currentStep() + 1);
  }

  previousStep(): void {
    this.setStep(this.currentStep() - 1);
  }

  get currentStepLabel(): string {
    return this.steps()[this.currentStep()]?.label ?? '';
  }

  get displayedHeaders(): string[] {
    const sections = this.sections();
    if (sections.length) {
      return sections.flatMap((section) => section.headers);
    }
    return this.excelHeaders().length ? this.excelHeaders() : this.fallbackHeaders;
  }

  get mappedCount(): number {
    return this.displayedHeaders.filter((header) => {
      const selection = this.selectedLabels()[header] ?? '';
      return selection && !this.isDangerOption(selection);
    }).length;
  }

  get totalHeaders(): number {
    return this.displayedHeaders.length;
  }

  get progressPercent(): number {
    if (!this.totalHeaders) {
      return 0;
    }
    return Math.round((this.mappedCount / this.totalHeaders) * 100);
  }

  getHeadersForStep(stepIndex: number): string[] {
    const sections = this.sections();
    if (sections.length) {
      return sections[stepIndex]?.headers ?? [];
    }
    const headers = this.excelHeaders();
    if (!headers.length) {
      return [];
    }
    const total = headers.length;
    const base = Math.floor(total / this.steps().length);
    const remainder = total % this.steps().length;
    const start = stepIndex * base + Math.min(stepIndex, remainder);
    const end = start + base + (stepIndex < remainder ? 1 : 0);
    return headers.slice(start, end);
  }

  get currentStepHeaders(): string[] {
    return this.getHeadersForStep(this.currentStep());
  }

  @HostListener('document:click')
  closeSelects(): void {
    this.openSelectId.set(null);
  }

  toggleSelect(id: string): void {
    this.openSelectId.set(this.openSelectId() === id ? null : id);
  }

  isSelectOpen(id: string): boolean {
    return this.openSelectId() === id;
  }

  getSelectedLabel(id: string): string {
    return this.selectedLabels()[id] ?? 'Seleccionar campo';
  }

  selectOption(id: string, label: string): void {
    this.selectedLabels.update((current) => ({ ...current, [id]: label }));
    this.openSelectId.set(null);
  }

  private getSectionRowIndex(worksheet: XLSX.WorkSheet): number {
    const merges = (worksheet['!merges'] ?? []) as XLSX.Range[];
    if (!merges.length) {
      return 0;
    }

    const rowCounts = new Map<number, number>();
    merges.forEach((merge) => {
      if (merge.s.r === merge.e.r) {
        rowCounts.set(merge.s.r, (rowCounts.get(merge.s.r) ?? 0) + 1);
      }
    });

    let bestRow = 0;
    let bestScore = -1;
    rowCounts.forEach((count, row) => {
      if (count > bestScore && row < 10) {
        bestScore = count;
        bestRow = row;
      }
    });

    return bestScore > 0 ? bestRow : 0;
  }

  private getSectionLabel(worksheet: XLSX.WorkSheet, rowIndex: number, colIndex: number): string {
    const merges = (worksheet['!merges'] ?? []) as XLSX.Range[];
    const merge = merges.find((item) => item.s.r === rowIndex && item.e.r === rowIndex
      && item.s.c <= colIndex && item.e.c >= colIndex);

    const cellAddress = XLSX.utils.encode_cell({
      r: rowIndex,
      c: merge ? merge.s.c : colIndex
    });
    const cellValue = worksheet[cellAddress]?.v ?? '';
    return String(cellValue).trim() || 'Datos generales';
  }

  private buildSections(
    worksheet: XLSX.WorkSheet,
    headers: string[],
    sectionRowIndex: number
  ): SectionConfig[] {
    if (!headers.length) {
      return [];
    }

    const grouped = new Map<string, string[]>();
    headers.forEach((header, index) => {
      const label = this.getSectionLabel(worksheet, sectionRowIndex, index);
      if (!grouped.has(label)) {
        grouped.set(label, []);
      }
      grouped.get(label)?.push(header);
    });

    const sections = Array.from(grouped.entries()).map(([label, headerList], index) => ({
      id: `section-${index + 1}`,
      label,
      headers: headerList
    }));

    if (sections.length <= 1 && headers.length >= this.defaultSteps.length) {
      return this.buildSplitSections(headers);
    }

    return sections;
  }

  private buildSplitSections(headers: string[]): SectionConfig[] {
    const total = headers.length;
    const base = Math.floor(total / this.defaultSteps.length);
    const remainder = total % this.defaultSteps.length;
    let start = 0;
    return this.defaultSteps.map((step, index) => {
      const extra = index < remainder ? 1 : 0;
      const end = start + base + extra;
      const slice = headers.slice(start, end);
      start = end;
      return {
        id: step.id,
        label: step.label,
        headers: slice
      };
    });
  }
}
