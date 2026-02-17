import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, signal } from '@angular/core';
import * as XLSX from 'xlsx';
import { ImportsService } from '@app/features/clients/services/imports.service';
import { StorageService } from '@app/core/storage/storage.service';
import { LocalStorageEnums } from '@app/shared/models/local.storage.enums';
import { ImportMappingCreateResult, ImportMappingDetectResult } from '@app/features/clients/models/imports.model';
import { ModalComponent } from '@app/shared/ui/modal/modal.component';

type StandardField = {
  id: string;
  label: string;
  apiKey: string;
};

type StandardSection = {
  id: string;
  title: string;
  fields: StandardField[];
};

@Component({
  selector: 'app-client-shipments-upload-v3-view',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  templateUrl: './client-shipments-upload-v3-view.component.html',
  styleUrl: './client-shipments-upload-v3-view.component.css'
})
export class ClientShipmentsUploadV3ViewComponent {
  private importsService = inject(ImportsService);
  private storageService = inject(StorageService);

  openSelectId = signal<string | null>(null);
  excelHeaders = signal<string[]>([]);
  excelFileName = signal<string | null>(null);
  excelError = signal<string | null>(null);
  searchText = signal<Record<string, string>>({});
  templateResult = signal<ImportMappingDetectResult | null>(null);
  templateError = signal<string | null>(null);
  mappingLoading = signal(false);
  mappingError = signal<string | null>(null);
  mappingResult = signal<ImportMappingCreateResult | null>(null);
  showTemplateDetectedModal = signal(false);

  /** Campos estándar EN DURO: lo que se envía al API. */
  readonly standardSections: StandardSection[] = [
    {
      id: 'pickup',
      title: 'Datos de recojo',
      fields: [
        { id: 'order_client_code', label: 'Código cliente', apiKey: 'order.client_code' },
        { id: 'order_guide_number', label: 'N° de guía', apiKey: 'order.guide_number' },
        { id: 'order_request_date', label: 'Fecha de solicitud', apiKey: 'order.request_date' },
        { id: 'pickup_company', label: 'Nombre de empresa (Recojo)', apiKey: 'pickup.company_name' },
        { id: 'pickup_contact', label: 'Nombre de contacto (Recojo)', apiKey: 'pickup.contact_name' },
        { id: 'pickup_phone', label: 'Celular (Recojo)', apiKey: 'pickup.phone' },
        { id: 'pickup_address', label: 'Dirección de recojo', apiKey: 'pickup.address' },
        { id: 'pickup_reference', label: 'Referencia (Recojo)', apiKey: 'pickup.reference' },
        { id: 'pickup_country', label: 'País', apiKey: 'pickup.country' },
        { id: 'pickup_district', label: 'Distrito (Recojo)', apiKey: 'pickup.district' },
        { id: 'pickup_province', label: 'Provincia (Recojo)', apiKey: 'pickup.province' },
        { id: 'pickup_department', label: 'Departamento (Recojo)', apiKey: 'pickup.department' },
        { id: 'pickup_date', label: 'Fecha de recojo', apiKey: 'pickup.date' },
        { id: 'pickup_start_time', label: 'Hora inicio de recojo', apiKey: 'pickup.time_from' },
        { id: 'pickup_end_time', label: 'Hora fin de recojo', apiKey: 'pickup.time_to' }
      ]
    },
    {
      id: 'delivery',
      title: 'Datos de entrega',
      fields: [
        { id: 'delivery_company', label: 'Nombre de empresa (Entrega)', apiKey: 'delivery.company_name' },
        { id: 'delivery_contact', label: 'Nombre de contacto (Entrega)', apiKey: 'delivery.contact_name' },
        { id: 'delivery_document', label: 'DNI (Entrega)', apiKey: 'delivery.dni' },
        { id: 'delivery_phone', label: 'Celular (Entrega)', apiKey: 'delivery.phone' },
        { id: 'delivery_address', label: 'Dirección (Entrega)', apiKey: 'delivery.address' },
        { id: 'delivery_reference', label: 'Referencia (Entrega)', apiKey: 'delivery.reference' },
        { id: 'delivery_district', label: 'Distrito (Entrega)', apiKey: 'delivery.district' },
        { id: 'delivery_province', label: 'Provincia (Entrega)', apiKey: 'delivery.province' },
        { id: 'delivery_department', label: 'Departamento (Entrega)', apiKey: 'delivery.department' }
      ]
    },
    {
      id: 'package',
      title: 'Datos de paquete',
      fields: [
        { id: 'package_description', label: 'Descripción del paquete', apiKey: 'package.description' },
        { id: 'package_qty', label: 'Cantidad de paquetes', apiKey: 'package.quantity' },
        { id: 'package_weight', label: 'Peso guía (KG)', apiKey: 'package.weight' },
        { id: 'package_size', label: 'Tamaño referencial guía', apiKey: 'package.size' },
        { id: 'package_height', label: 'Alto CM', apiKey: 'package.height' },
        { id: 'package_width', label: 'Ancho CM', apiKey: 'package.width' },
        { id: 'package_depth', label: 'Profundidad CM', apiKey: 'package.length' },
        { id: 'package_volumetric', label: 'Peso volumétrico guía', apiKey: 'package.volumetric_weight' },
        { id: 'package_m3', label: 'M3 guía', apiKey: 'package.m3' },
        { id: 'package_value', label: 'Valor estimado (opcional)', apiKey: 'order.estimated_value' },
        { id: 'package_notes', label: 'Observaciones (opcional)', apiKey: 'order.observations' }
      ]
    }
  ];

  /** fieldId -> columna Excel seleccionada */
  selectedMappings = signal<Record<string, string>>({});

  resetFileInput(input: HTMLInputElement): void {
    input.value = '';
  }

  onDescartar(fileInput?: HTMLInputElement): void {
    this.excelHeaders.set([]);
    this.selectedMappings.set({});
    this.excelFileName.set(null);
    this.excelError.set(null);
    this.templateResult.set(null);
    this.templateError.set(null);
    this.mappingError.set(null);
    this.mappingResult.set(null);
    this.showTemplateDetectedModal.set(false);
    this.searchText.set({});
    this.openSelectId.set(null);
    if (fileInput) this.resetFileInput(fileInput);
  }

  onExcelFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0];
    if (!file) return;

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
        const rawHeaders = headerRow
          .map((v: unknown) => String(v).trim())
          .filter((v: string) => Boolean(v));
        const headers = this.disambiguateDuplicateHeaders(rawHeaders);
        this.excelHeaders.set(headers);
        this.detectTemplate(headers);
      } catch {
        this.excelError.set('No se pudo leer el archivo. Verifica el formato.');
      }
    };
    reader.onerror = () => {
      this.excelError.set('No se pudo leer el archivo. Intenta nuevamente.');
    };
    reader.readAsArrayBuffer(file);
  }

  /** Opciones del dropdown = columnas del Excel */
  getDropdownOptions(fieldId: string): string[] {
    const headers = this.excelHeaders();
    const selected = this.selectedMappings();
    const used = new Set(
      Object.entries(selected)
        .filter(([k, v]) => k !== fieldId && v)
        .map(([, v]) => v)
    );
    return ['Opcional', ...headers.filter((h) => !used.has(h))];
  }

  getFilteredOptions(fieldId: string): string[] {
    const options = this.getDropdownOptions(fieldId);
    const query = this.normalizeForSearch(this.getSearchValue(fieldId));
    if (!query) return options;
    return options.filter((o) => this.normalizeForSearch(o).includes(query));
  }

  /**
   * Si hay columnas repetidas en el Excel (ej. PROVINCIA en recojo y entrega),
   * las hace únicas con sufijos: PROVINCIA__1, PROVINCIA__2, etc.
   */
  private disambiguateDuplicateHeaders(rawHeaders: string[]): string[] {
    const normalizedCounts = new Map<string, number>();
    rawHeaders.forEach((h) => {
      const n = this.normalizeForSearch(h);
      normalizedCounts.set(n, (normalizedCounts.get(n) ?? 0) + 1);
    });

    const occurrenceIndex = new Map<string, number>();
    return rawHeaders.map((h) => {
      const n = this.normalizeForSearch(h);
      const total = normalizedCounts.get(n) ?? 1;
      if (total <= 1) return h;
      const idx = (occurrenceIndex.get(n) ?? 0) + 1;
      occurrenceIndex.set(n, idx);
      return `${h}__${idx}`;
    });
  }

  private normalizeForSearch(v: string): string {
    return (v ?? '')
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  selectOption(fieldId: string, excelHeader: string): void {
    this.selectedMappings.update((curr) => ({ ...curr, [fieldId]: excelHeader }));
    this.openSelectId.set(null);
  }

  isSelected(fieldId: string, excelHeader: string): boolean {
    return this.selectedMappings()[fieldId] === excelHeader;
  }

  getSelectedLabel(fieldId: string): string {
    const v = this.selectedMappings()[fieldId];
    return v || 'Seleccionar campo';
  }

  isCardPending(fieldId: string): boolean {
    const v = this.selectedMappings()[fieldId];
    return !v || v === 'Opcional';
  }

  @HostListener('document:click')
  closeSelects(): void {
    this.openSelectId.set(null);
  }

  toggleSelect(fieldId: string): void {
    if (this.openSelectId() === fieldId) {
      this.openSelectId.set(null);
      return;
    }
    this.openSelectId.set(fieldId);
    this.searchText.update((c) => ({ ...c, [fieldId]: c[fieldId] ?? '' }));
    setTimeout(() => {
      const el = document.getElementById(`search-${fieldId}`) as HTMLInputElement | null;
      el?.focus();
      el?.select();
    }, 0);
  }

  isSelectOpen(fieldId: string): boolean {
    return this.openSelectId() === fieldId;
  }

  setSearchValue(fieldId: string, value: string): void {
    this.searchText.update((c) => ({ ...c, [fieldId]: value }));
  }

  getSearchValue(fieldId: string): string {
    return this.searchText()[fieldId] ?? '';
  }

  mappedCount(): number {
    return Object.values(this.selectedMappings()).filter((v) => v && v !== 'Opcional').length;
  }

  totalFields(): number {
    return this.standardSections.reduce((sum, s) => sum + s.fields.length, 0);
  }

  progressPercent(): number {
    const total = this.totalFields();
    return total ? Math.round((this.mappedCount() / total) * 100) : 0;
  }

  progressRingDashOffset(): number {
    return 2 * Math.PI * 20 * (1 - this.progressPercent() / 100);
  }

  getSectionTitleShort(id: string): string {
    const m: Record<string, string> = { pickup: 'Recojo', delivery: 'Entrega', package: 'Paquete' };
    return m[id] ?? id;
  }

  private detectTemplate(headers: string[]): void {
    const clientId = this.storageService.getItem(LocalStorageEnums.ID);
    if (!clientId || !headers.length) return;

    this.templateError.set(null);
    this.importsService.detectMapping({ client_id: clientId, headers }).subscribe({
      next: (res) => {
        const result = res?.result ?? null;
        this.templateResult.set(result);
        if (result?.mapping && Object.keys(result.mapping).length > 0) {
          this.applyDetectedTemplate(result);
          this.showTemplateDetectedModal.set(true);
        } else {
          this.showTemplateDetectedModal.set(false);
        }
      },
      error: () => {
        this.templateError.set('No se pudo validar el template.');
        this.showTemplateDetectedModal.set(false);
      }
    });
  }

  private applyDetectedTemplate(result: ImportMappingDetectResult): void {
    const apiKeyToFieldId = this.getApiKeyToFieldIdMap();
    const headers = this.excelHeaders();
    const next: Record<string, string> = {};

    Object.entries(result.mapping).forEach(([apiKey, excelHeaderName]) => {
      const fieldId = apiKeyToFieldId[apiKey];
      if (!fieldId) return;
      const match = headers.find((h) => this.normalizeForSearch(h) === this.normalizeForSearch(excelHeaderName));
      if (match) next[fieldId] = match;
    });

    this.selectedMappings.update((prev) => ({ ...prev, ...next }));
  }

  private getApiKeyToFieldIdMap(): Record<string, string> {
    const map: Record<string, string> = {};
    this.standardSections.forEach((s) =>
      s.fields.forEach((f) => {
        map[f.apiKey] = f.id;
      })
    );
    return map;
  }

  closeTemplateDetectedModal(): void {
    this.showTemplateDetectedModal.set(false);
  }

  createTemplate(): void {
    if (this.mappingLoading()) return;

    const clientId = this.storageService.getItem(LocalStorageEnums.ID);
    const headers = this.excelHeaders();
    if (!clientId || !headers.length) {
      this.mappingError.set('Debes cargar un Excel válido antes de guardar.');
      return;
    }

    const selections = this.selectedMappings();
    const mapping: Record<string, string> = {};
    this.standardSections.forEach((s) =>
      s.fields.forEach((f) => {
        mapping[f.apiKey] = selections[f.id] ?? 'Opcional';
      })
    );

    this.mappingError.set(null);
    this.mappingLoading.set(true);
    this.importsService.createMapping({ client_id: clientId, headers, mapping }).subscribe({
      next: (res) => {
        this.mappingResult.set(res?.result ?? null);
        this.mappingLoading.set(false);
      },
      error: () => {
        this.mappingError.set('No se pudo guardar el template.');
        this.mappingLoading.set(false);
      }
    });
  }
}
