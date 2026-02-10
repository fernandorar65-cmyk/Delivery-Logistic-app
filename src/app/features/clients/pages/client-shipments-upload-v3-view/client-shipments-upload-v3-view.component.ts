import { CommonModule } from '@angular/common';
import { Component, HostListener, signal } from '@angular/core';
import * as XLSX from 'xlsx';

type StandardField = {
  id: string;
  label: string;
};

type StandardSection = {
  id: string;
  title: string;
  fields: StandardField[];
};

@Component({
  selector: 'app-client-shipments-upload-v3-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './client-shipments-upload-v3-view.component.html',
  styleUrl: './client-shipments-upload-v3-view.component.css'
})
export class ClientShipmentsUploadV3ViewComponent {
  openSelectId = signal<string | null>(null);
  excelHeaders = signal<string[]>([]);
  excelFileName = signal<string | null>(null);
  excelError = signal<string | null>(null);
  accordionOpen = signal<Record<string, boolean>>({});

  readonly standardSections: StandardSection[] = [
    {
      id: 'pickup',
      title: 'Datos de recojo',
      fields: [
        { id: 'pickup_company', label: 'Nombre de empresa (Punto de recojo)' },
        { id: 'pickup_contact', label: 'Nombre de contacto' },
        { id: 'pickup_phone', label: 'Celular' },
        { id: 'pickup_address', label: 'Dirección de recojo' },
        { id: 'pickup_reference', label: 'Referencia especificar piso/oficina/número de tienda' },
        { id: 'pickup_country', label: 'País' },
        { id: 'pickup_district', label: 'Distrito' },
        { id: 'pickup_province', label: 'Provincia' },
        { id: 'pickup_department', label: 'Departamento' },
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
        { id: 'delivery_contact', label: 'Nombre de contacto' },
        { id: 'delivery_document', label: 'DNI' },
        { id: 'delivery_phone', label: 'Celular' },
        { id: 'delivery_address', label: 'Dirección' },
        { id: 'delivery_reference', label: 'Referencia especificar piso/oficina/número de tienda' },
        { id: 'delivery_district', label: 'Distrito' },
        { id: 'delivery_province', label: 'Provincia' },
        { id: 'delivery_department', label: 'Departamento' }
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
    const options = this.excelHeaders();
    if (!options.length) {
      return ['Opcional'];
    }
    return ['Opcional', ...options];
  }

  getAvailableOptions(fieldId: string): string[] {
    const options = this.getOptions();
    const selected = this.selectedMappings();
    const used = new Set(Object.entries(selected)
      .filter(([key, value]) => key !== fieldId && value && value !== 'Opcional')
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

  selectOption(fieldId: string, value: string): void {
    this.selectedMappings.update((current) => ({ ...current, [fieldId]: value }));
  }

  isSelected(fieldId: string, value: string): boolean {
    return this.selectedMappings()[fieldId] === value;
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

  getFieldIcon(fieldId: string): string {
    return this.fieldIconMap[fieldId] ?? 'list_alt';
  }

  getTopSections(): StandardSection[] {
    return this.standardSections.slice(0, 2);
  }

  getAccordionSections(): StandardSection[] {
    return this.standardSections.slice(2);
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
}
