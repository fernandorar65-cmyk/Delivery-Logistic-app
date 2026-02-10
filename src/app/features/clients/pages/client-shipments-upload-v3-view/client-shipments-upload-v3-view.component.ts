import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, signal } from '@angular/core';
import * as XLSX from 'xlsx';
import { ImportsService } from '@app/features/clients/services/imports.service';
import { StorageService } from '@app/core/storage/storage.service';
import { LocalStorageEnums } from '@app/shared/models/local.storage.enums';
import { ImportMappingCreateResponse, ImportMappingDetectResponse } from '@app/features/clients/models/imports.model';

type StandardField = {
  id: string;
  label: string;
};

type StandardSection = {
  id: string;
  title: string;
  fields: StandardField[];
};

type HeaderGroup = {
  id: string;
  title: string;
  headers: string[];
};

@Component({
  selector: 'app-client-shipments-upload-v3-view',
  standalone: true,
  imports: [CommonModule],
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
  accordionOpen = signal<Record<string, boolean>>({});
  templateResult = signal<ImportMappingDetectResponse['result'] | null>(null);
  templateError = signal<string | null>(null);
  mappingLoading = signal(false);
  mappingError = signal<string | null>(null);
  mappingResult = signal<ImportMappingCreateResponse['result'] | null>(null);

  readonly standardSections: StandardSection[] = [
    {
      id: 'pickup',
      title: 'Datos de recojo',
      fields: [
        { id: 'pickup_company', label: 'Nombre de empresa (Punto de recojo)' },
        { id: 'pickup_contact', label: 'Nombre de contacto (Recojo)' },
        { id: 'pickup_phone', label: 'Celular (Recojo)' },
        { id: 'pickup_address', label: 'Dirección de recojo' },
        { id: 'pickup_reference', label: 'Referencia especificar piso/oficina/número de tienda' },
        { id: 'pickup_country', label: 'País' },
        { id: 'pickup_district', label: 'Distrito' },
        { id: 'pickup_province', label: 'Provincia (Recojo)' },
        { id: 'pickup_department', label: 'Departamento (Recojo)' },
        { id: 'pickup_date', label: 'Fecha de recojo' },
        { id: 'pickup_start_time', label: 'Hora inicio de recojo' },
        { id: 'pickup_end_time', label: 'Hora fin de recojo' }
      ]
    },
    {
      id: 'delivery',
      title: 'Datos de entrega',
      fields: [
        { id: 'delivery_company', label: 'Nombre de empresa (Punto de entrega)' },
        { id: 'delivery_contact', label: 'Nombre de contacto (Entrega)' },
        { id: 'delivery_document', label: 'DNI' },
        { id: 'delivery_phone', label: 'Celular (Entrega)' },
        { id: 'delivery_address', label: 'Dirección' },
        { id: 'delivery_reference', label: 'Referencia especificar piso/oficina/número de tienda' },
        { id: 'delivery_district', label: 'Distrito' },
        { id: 'delivery_province', label: 'Provincia (Entrega)' },
        { id: 'delivery_department', label: 'Departamento (Entrega)' }
      ]
    },
    {
      id: 'package',
      title: 'Datos de paquete',
      fields: [
        { id: 'package_description', label: 'Descripción del paquete' },
        { id: 'package_qty', label: 'Cantidad de paquetes' },
        { id: 'package_weight', label: 'Peso guía (KG)' },
        { id: 'package_size', label: 'Tamaño referencial guía' },
        { id: 'package_height', label: 'Alto CM' },
        { id: 'package_width', label: 'Ancho CM' },
        { id: 'package_depth', label: 'Profundidad CM' },
        { id: 'package_volumetric', label: 'Peso volumétrico guía' },
        { id: 'package_m3', label: 'M3 guía' },
        { id: 'package_value', label: 'Valor estimado (opcional)' },
        { id: 'package_notes', label: 'Observaciones (opcional)' }
      ]
    }
  ];

  selectedMappings = signal<Record<string, string>>({});
  private readonly fieldIconMap: Record<string, string> = {
    pickup_company: 'storefront',
    pickup_contact: 'person',
    pickup_phone: 'call',
    pickup_address: 'location_on',
    pickup_reference: 'edit_location_alt',
    pickup_country: 'public',
    pickup_district: 'map',
    pickup_province: 'location_city',
    pickup_department: 'apartment',
    pickup_date: 'calendar_month',
    pickup_start_time: 'schedule',
    pickup_end_time: 'schedule',
    delivery_company: 'storefront',
    delivery_contact: 'person',
    delivery_document: 'badge',
    delivery_phone: 'call',
    delivery_address: 'location_on',
    delivery_reference: 'edit_location_alt',
    delivery_district: 'map',
    delivery_province: 'location_city',
    delivery_department: 'apartment',
    package_description: 'inventory_2',
    package_qty: 'inventory',
    package_weight: 'scale',
    package_size: 'straighten',
    package_height: 'height',
    package_width: 'width',
    package_depth: 'unfold_more',
    package_volumetric: 'straighten',
    package_m3: 'cube',
    package_value: 'payments',
    package_notes: 'note'
  };

  private readonly fieldKeyMap: Record<string, string> = {
    pickup_company: 'pickup.company_name',
    pickup_contact: 'pickup.contact_name',
    pickup_phone: 'pickup.phone',
    pickup_address: 'pickup.address',
    pickup_reference: 'pickup.reference',
    pickup_country: 'pickup.country',
    pickup_department: 'pickup.department',
    pickup_province: 'pickup.province',
    pickup_district: 'pickup.district',
    pickup_date: 'pickup.date',
    pickup_start_time: 'pickup.time_from',
    pickup_end_time: 'pickup.time_to',
    delivery_company: 'delivery.company_name',
    delivery_contact: 'delivery.contact_name',
    delivery_document: 'delivery.dni',
    delivery_phone: 'delivery.phone',
    delivery_address: 'delivery.address',
    delivery_reference: 'delivery.reference',
    delivery_department: 'delivery.department',
    delivery_province: 'delivery.province',
    delivery_district: 'delivery.district',
    package_description: 'package.description',
    package_qty: 'package.quantity',
    package_weight: 'package.weight',
    package_size: 'package.size',
    package_height: 'package.height',
    package_width: 'package.width',
    package_depth: 'package.length',
    package_volumetric: 'package.volumetric_weight',
    package_m3: 'package.m3',
    package_value: 'order.estimated_value',
    package_notes: 'order.observations'
  };

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
        this.excelHeaders.set(headers);
        this.detectTemplate(headers);
      } catch (error) {
        this.excelError.set('No se pudo leer el archivo. Verifica el formato.');
      }
    };
    reader.onerror = () => {
      this.excelError.set('No se pudo leer el archivo. Intenta nuevamente.');
    };
    reader.readAsArrayBuffer(file);
  }

  getOptions(): string[] {
    return ['Opcional', ...this.getFieldOptions().map((option) => option.id)];
  }

  getAvailableOptions(header: string): string[] {
    const options = this.getOptions();
    const selected = this.selectedMappings();
    const used = new Set(Object.entries(selected)
      .filter(([key, value]) => key !== header && value && value !== 'Opcional')
      .map(([, value]) => value));
    return options.filter((option) => !used.has(option));
  }

  mappedCount(): number {
    const selected = this.selectedMappings();
    return Object.values(selected).filter((value) => value && value !== 'Opcional').length;
  }

  totalHeaders(): number {
    return this.excelHeaders().length;
  }

  progressPercent(): number {
    const total = this.totalHeaders();
    if (!total) {
      return 0;
    }
    return Math.round((this.mappedCount() / total) * 100);
  }

  selectOption(header: string, value: string): void {
    this.selectedMappings.update((current) => ({ ...current, [header]: value }));
  }

  isSelected(header: string, value: string): boolean {
    return this.selectedMappings()[header] === value;
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

  getSelectedLabel(header: string): string {
    return this.getOptionLabel(this.selectedMappings()[header]);
  }

  getOptionLabel(optionId?: string): string {
    if (!optionId) {
      return 'Seleccionar campo';
    }
    if (optionId === 'Opcional') {
      return 'Opcional';
    }
    const option = this.getFieldOptions().find((item) => item.id === optionId);
    return option?.displayLabel ?? optionId;
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

  getFieldIcon(fieldId: string): string {
    return this.fieldIconMap[fieldId] ?? 'list_alt';
  }

  createTemplate(): void {
    if (this.mappingLoading()) {
      return;
    }
    const clientId = this.storageService.getItem(LocalStorageEnums.ID);
    const headers = this.excelHeaders();
    if (!clientId || !headers.length) {
      this.mappingError.set('Debes cargar un Excel válido antes de guardar.');
      return;
    }

    const selections = this.selectedMappings();
    const mapping = this.getFieldOptions().reduce<Record<string, string>>((acc, option) => {
      const header = Object.entries(selections).find(([, value]) => value === option.id)?.[0] ?? 'Opcional';
      acc[option.apiKey] = header || 'Opcional';
      return acc;
    }, {});

    this.mappingError.set(null);
    this.mappingLoading.set(true);
    this.importsService.createMapping({ client_id: clientId, headers, mapping }).subscribe({
      next: (response) => {
        this.mappingResult.set(response?.result ?? null);
        this.mappingLoading.set(false);
      },
      error: () => {
        this.mappingError.set('No se pudo guardar el template.');
        this.mappingLoading.set(false);
      }
    });
  }

  getTopSections(): HeaderGroup[] {
    return this.getHeaderGroups().slice(0, 2);
  }

  getAccordionSections(): HeaderGroup[] {
    return this.getHeaderGroups().slice(2);
  }

  toggleAccordion(sectionId: string): void {
    this.accordionOpen.update((current) => ({
      ...current,
      [sectionId]: !current[sectionId]
    }));
  }

  isAccordionOpen(sectionId: string): boolean {
    return Boolean(this.accordionOpen()[sectionId]);
  }

  private getFieldOptions(): Array<{
    id: string;
    label: string;
    apiKey: string;
    displayLabel: string;
  }> {
    return [
      { id: 'pickup_company', label: 'Nombre de empresa (Punto de recojo)', displayLabel: 'Nombre de empresa (Recojo)', apiKey: this.getApiKeyForField('pickup_company') },
      { id: 'pickup_contact', label: 'Nombre de contacto', displayLabel: 'Nombre de contacto (Recojo)', apiKey: this.getApiKeyForField('pickup_contact') },
      { id: 'pickup_phone', label: 'Celular', displayLabel: 'Celular (Recojo)', apiKey: this.getApiKeyForField('pickup_phone') },
      { id: 'pickup_address', label: 'Dirección de recojo', displayLabel: 'Dirección de recojo', apiKey: this.getApiKeyForField('pickup_address') },
      { id: 'pickup_reference', label: 'Referencia especificar piso/oficina/número de tienda', displayLabel: 'Referencia (Recojo)', apiKey: this.getApiKeyForField('pickup_reference') },
      { id: 'pickup_country', label: 'País', displayLabel: 'País (Recojo)', apiKey: this.getApiKeyForField('pickup_country') },
      { id: 'pickup_district', label: 'Distrito', displayLabel: 'Distrito (Recojo)', apiKey: this.getApiKeyForField('pickup_district') },
      { id: 'pickup_province', label: 'Provincia', displayLabel: 'Provincia (Recojo)', apiKey: this.getApiKeyForField('pickup_province') },
      { id: 'pickup_department', label: 'Departamento', displayLabel: 'Departamento (Recojo)', apiKey: this.getApiKeyForField('pickup_department') },
      { id: 'pickup_date', label: 'Fecha de recojo', displayLabel: 'Fecha de recojo', apiKey: this.getApiKeyForField('pickup_date') },
      { id: 'pickup_start_time', label: 'Hora inicio de recojo', displayLabel: 'Hora inicio de recojo', apiKey: this.getApiKeyForField('pickup_start_time') },
      { id: 'pickup_end_time', label: 'Hora fin de recojo', displayLabel: 'Hora fin de recojo', apiKey: this.getApiKeyForField('pickup_end_time') },
      { id: 'delivery_company', label: 'Nombre de empresa (Punto de entrega)', displayLabel: 'Nombre de empresa (Entrega)', apiKey: this.getApiKeyForField('delivery_company') },
      { id: 'delivery_contact', label: 'Nombre de contacto', displayLabel: 'Nombre de contacto (Entrega)', apiKey: this.getApiKeyForField('delivery_contact') },
      { id: 'delivery_document', label: 'DNI', displayLabel: 'DNI (Entrega)', apiKey: this.getApiKeyForField('delivery_document') },
      { id: 'delivery_phone', label: 'Celular', displayLabel: 'Celular (Entrega)', apiKey: this.getApiKeyForField('delivery_phone') },
      { id: 'delivery_address', label: 'Dirección', displayLabel: 'Dirección (Entrega)', apiKey: this.getApiKeyForField('delivery_address') },
      { id: 'delivery_reference', label: 'Referencia especificar piso/oficina/número de tienda', displayLabel: 'Referencia (Entrega)', apiKey: this.getApiKeyForField('delivery_reference') },
      { id: 'delivery_district', label: 'Distrito', displayLabel: 'Distrito (Entrega)', apiKey: this.getApiKeyForField('delivery_district') },
      { id: 'delivery_province', label: 'Provincia', displayLabel: 'Provincia (Entrega)', apiKey: this.getApiKeyForField('delivery_province') },
      { id: 'delivery_department', label: 'Departamento', displayLabel: 'Departamento (Entrega)', apiKey: this.getApiKeyForField('delivery_department') },
      { id: 'package_description', label: 'Descripción del paquete', displayLabel: 'Descripción del paquete', apiKey: this.getApiKeyForField('package_description') },
      { id: 'package_qty', label: 'Cantidad de paquetes', displayLabel: 'Cantidad de paquetes', apiKey: this.getApiKeyForField('package_qty') },
      { id: 'package_weight', label: 'Peso guía (KG)', displayLabel: 'Peso guía (KG)', apiKey: this.getApiKeyForField('package_weight') },
      { id: 'package_size', label: 'Tamaño referencial guía', displayLabel: 'Tamaño referencial guía', apiKey: this.getApiKeyForField('package_size') },
      { id: 'package_height', label: 'Alto CM', displayLabel: 'Alto CM', apiKey: this.getApiKeyForField('package_height') },
      { id: 'package_width', label: 'Ancho CM', displayLabel: 'Ancho CM', apiKey: this.getApiKeyForField('package_width') },
      { id: 'package_depth', label: 'Profundidad CM', displayLabel: 'Profundidad CM', apiKey: this.getApiKeyForField('package_depth') },
      { id: 'package_volumetric', label: 'Peso volumétrico guía', displayLabel: 'Peso volumétrico guía', apiKey: this.getApiKeyForField('package_volumetric') },
      { id: 'package_m3', label: 'M3 guía', displayLabel: 'M3 guía', apiKey: this.getApiKeyForField('package_m3') },
      { id: 'package_value', label: 'Valor estimado (opcional)', displayLabel: 'Valor estimado (opcional)', apiKey: this.getApiKeyForField('package_value') },
      { id: 'package_notes', label: 'Observaciones (opcional)', displayLabel: 'Observaciones (opcional)', apiKey: this.getApiKeyForField('package_notes') }
    ];
  }

  private getApiKeyForField(fieldId: string): string {
    return this.fieldKeyMap[fieldId] ?? fieldId;
  }

  private getHeaderGroups(): HeaderGroup[] {
    const headers = this.excelHeaders();
    if (!headers.length) {
      return [];
    }
    const titles = this.standardSections.map((section) => section.title);
    const total = headers.length;
    const base = Math.floor(total / titles.length);
    const remainder = total % titles.length;
    let start = 0;
    return titles.map((title, index) => {
      const extra = index < remainder ? 1 : 0;
      const end = start + base + extra;
      const slice = headers.slice(start, end);
      const group = {
        id: `group-${index + 1}`,
        title,
        headers: slice
      };
      start = end;
      return group;
    });
  }
}
