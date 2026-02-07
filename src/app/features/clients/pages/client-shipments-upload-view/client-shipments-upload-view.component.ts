import { CommonModule } from '@angular/common';
import { Component, HostListener, signal } from '@angular/core';
import { ModalComponent } from '@app/shared/ui/modal/modal.component';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-client-shipments-upload-view',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  templateUrl: './client-shipments-upload-view.component.html',
  styleUrl: './client-shipments-upload-view.component.css'
})
export class ClientShipmentsUploadViewComponent {
  uploadModalOpen = signal(false);
  openSelectId = signal<string | null>(null);
  currentStep = signal(0);
  readonly steps = [
    { id: 'order', label: 'Datos de Contacto Recogo' },
    { id: 'receiver', label: 'Datos de Entrega' },
    { id: 'logistics', label: 'Paquete' }
  ];
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

  openUploadModal(): void {
    this.uploadModalOpen.set(true);
  }

  closeUploadModal(): void {
    this.uploadModalOpen.set(false);
  }

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
        const headerRow = rows?.[1] ?? [];
        const headers = headerRow
          .map((value) => String(value).trim())
          .filter((value) => Boolean(value));
        const sampleRow = rows?.[2] ?? [];
        const samples = headers.reduce<Record<string, string>>((acc, header, index) => {
          acc[header] = String(sampleRow[index] ?? '').trim() || 'Sin ejemplo';
          return acc;
        }, {});
        this.excelHeaders.set(headers);
        this.excelSamples.set(samples);
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

  getSample(header: string): string {
    return this.excelSamples()[header] ?? 'Sin ejemplo';
  }

  isDangerOption(option: string): boolean {
    return option.toLowerCase().includes('omitir');
  }

  setStep(index: number): void {
    if (index < 0 || index >= this.steps.length) {
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
    return this.steps[this.currentStep()]?.label ?? '';
  }

  get displayedHeaders(): string[] {
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
    const headers = this.excelHeaders();
    if (!headers.length) {
      return [];
    }
    const total = headers.length;
    const base = Math.floor(total / this.steps.length);
    const remainder = total % this.steps.length;
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
}
