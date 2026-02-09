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
    return options.length ? options : ['Sin columnas'];
  }

  getAvailableOptions(fieldId: string): string[] {
    const options = this.getOptions();
    if (options.length === 1 && options[0] === 'Sin columnas') {
      return options;
    }
    const selected = this.selectedMappings();
    const used = new Set(Object.entries(selected)
      .filter(([key, value]) => key !== fieldId && value)
      .map(([, value]) => value));
    return options.filter((option) => !used.has(option));
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
}
