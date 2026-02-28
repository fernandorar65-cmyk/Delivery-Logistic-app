import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { from, switchMap } from 'rxjs';
import * as XLSX from 'xlsx';
import { ImportsService } from '@app/features/clients/services/imports.service';
import { StorageService } from '@app/core/storage/storage.service';
import { LocalStorageEnums } from '@app/shared/models/local.storage.enums';
import { ImportExecutionResult, ImportMappingCreateResult, ImportMappingDetectResult } from '@app/features/clients/models/imports.model';
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
  imports: [CommonModule, ModalComponent, RouterLink],
  templateUrl: './client-shipments-upload-v3-view.component.html',
  styleUrl: './client-shipments-upload-v3-view.component.css'
})
export class ClientShipmentsUploadV3ViewComponent {
  private importsService = inject(ImportsService);
  private storageService = inject(StorageService);
  private route = inject(ActivatedRoute);

  /** company_id pasado desde Companies (query param); se envía en el body de la ejecución. */
  companyId = signal<string | null>(null);

  openSelectId = signal<string | null>(null);
  excelHeaders = signal<string[]>([]);
  excelFileName = signal<string | null>(null);
  /** Archivo Excel actual (para enviarlo en ejecución). */
  currentExcelFile = signal<File | null>(null);
  excelError = signal<string | null>(null);
  searchText = signal<Record<string, string>>({});
  templateResult = signal<ImportMappingDetectResult | null>(null);
  templateError = signal<string | null>(null);
  mappingLoading = signal(false);
  mappingError = signal<string | null>(null);
  mappingResult = signal<ImportMappingCreateResult | null>(null);
  orderLoading = signal(false);
  orderError = signal<string | null>(null);
  orderResult = signal<ImportExecutionResult | null>(null);
  showTemplateDetectedModal = signal(false);
  showHeaderErrorModal = signal(false);
  headerErrorMessage = signal<string | null>(null);
  /** Índice de la fila de cabeceras en el Excel (0, 1 o 2) para reescribirla al subir la orden. */
  headerRowIndex = signal<number>(0);

  /** Mínimo de celdas no vacías para considerar una fila como fila de cabeceras. */
  private readonly minHeaderColumns = 6;

  /** Claves obligatorias según la API: order.tracking_number, order.request_date y ambas direcciones. */
  private readonly requiredMappingKeys = [
    'order.tracking_number',
    'order.request_date'
  ] as const;
  private readonly requiredAddressKeys = ['pickup.address', 'delivery.address'] as const;

  /** Campos estándar EN DURO: lo que se envía al API. Clave = campo sistema, valor = nombre columna Excel. */
  readonly standardSections: StandardSection[] = [
    {
      id: 'pickup',
      title: 'Datos de recojo',
      fields: [
        { id: 'order_client_code', label: 'Código cliente', apiKey: 'order.client_code' },
        { id: 'order_tracking_number', label: 'N° de guía', apiKey: 'order.tracking_number' },
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

  constructor() {
    this.route.queryParams.subscribe(params => {
      const id = params['company_id'];
      this.companyId.set(typeof id === 'string' && id.length > 0 ? id : null);
    });
  }

  resetFileInput(input: HTMLInputElement): void {
    input.value = '';
  }

  onDescartar(fileInput?: HTMLInputElement): void {
    this.excelHeaders.set([]);
    this.selectedMappings.set({});
    this.excelFileName.set(null);
    this.currentExcelFile.set(null);
    this.excelError.set(null);
    this.templateResult.set(null);
    this.templateError.set(null);
    this.mappingError.set(null);
    this.mappingResult.set(null);
    this.orderError.set(null);
    this.orderResult.set(null);
    this.showTemplateDetectedModal.set(false);
    this.showHeaderErrorModal.set(false);
    this.headerErrorMessage.set(null);
    this.headerRowIndex.set(0);
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
    this.currentExcelFile.set(file);
    this.orderResult.set(null);

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = new Uint8Array(reader.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' }) as string[][];
        const headerRowIndex = this.findHeaderRowIndex(rows);
        if (headerRowIndex === null) {
          this.headerErrorMessage.set(
            `No se encontró una fila de cabeceras válida en las primeras 3 filas del Excel. ` +
            `Se espera al menos ${this.minHeaderColumns} columnas con nombre. Revisa el archivo e intenta de nuevo.`
          );
          this.showHeaderErrorModal.set(true);
          this.excelHeaders.set([]);
          this.currentExcelFile.set(null);
          this.excelFileName.set(null);
          return;
        }
        this.headerRowIndex.set(headerRowIndex);
        const headerRow = rows[headerRowIndex] ?? [];
        const rawHeaders = headerRow
          .map((v: unknown) => String(v).trim())
          .filter((v: string) => Boolean(v));
        const normalizedHeaders = rawHeaders.map((h: string) => h.trim().toLowerCase());
        const headers = this.disambiguateDuplicateHeaders(normalizedHeaders);
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

  /**
   * Busca la fila de cabeceras en las primeras 3 filas (índices 0, 1, 2).
   * Una fila válida tiene al menos minHeaderColumns celdas no vacías.
   * Retorna el índice de la fila o null si ninguna cumple.
   */
  private findHeaderRowIndex(rows: string[][]): number | null {
    if (!rows?.length) return null;
    for (let i = 0; i <= 2 && i < rows.length; i++) {
      const row = rows[i] ?? [];
      const nonEmpty = row
        .map((v: unknown) => String(v).trim())
        .filter((v: string) => Boolean(v));
      if (nonEmpty.length >= this.minHeaderColumns) return i;
    }
    return null;
  }

  closeHeaderErrorModal(): void {
    this.showHeaderErrorModal.set(false);
    this.headerErrorMessage.set(null);
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
    const normalizedHeaders = this.normalizeHeaders(headers);
    this.importsService.detectMapping({ client_id: clientId, headers: normalizedHeaders }).subscribe({
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
      const match = headers.find((h) => this.normalizeHeaderValue(h) === this.normalizeHeaderValue(excelHeaderName));
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

  /** Construye el objeto mapping: clave = campo del sistema, valor = nombre de columna del Excel. */
  private buildMapping(): Record<string, string> {
    const selections = this.selectedMappings();
    const mapping: Record<string, string> = {};
    this.standardSections.forEach((s) =>
      s.fields.forEach((f) => {
        mapping[f.apiKey] = selections[f.id] ?? 'Opcional';
      })
    );
    return mapping;
  }


  private validateRequiredMapping(mapping: Record<string, string>): string | null {
    const hasValue = (v: string) => v && v !== 'Opcional';
    for (const key of this.requiredMappingKeys) {
      if (!hasValue(mapping[key])) {
        const label = key === 'order.tracking_number' ? 'N° de guía' : 'Fecha de solicitud';
        return `Falta mapear el campo obligatorio: ${label} (${key}). Asigna una columna del Excel.`;
      }
    }
    const hasAddress = this.requiredAddressKeys.some((key) => hasValue(mapping[key]));
    if (!hasAddress) {
      return 'Debes mapear al menos una dirección: Dirección de recojo o Dirección (Entrega).';
    }
    return null;
  }

  createTemplate(): void {
    if (this.mappingLoading()) return;

    const clientId = this.storageService.getItem(LocalStorageEnums.ID);
    const headers = this.excelHeaders();
    if (!clientId || !headers.length) {
      this.mappingError.set('Debes cargar un Excel válido antes de guardar.');
      return;
    }

    const mapping = this.buildMapping();
    const validationError = this.validateRequiredMapping(mapping);
    if (validationError) {
      this.mappingError.set(validationError);
      return;
    }

    this.mappingError.set(null);
    this.mappingLoading.set(true);

    console.log('[Guardar plantilla] Headers originales:', headers);
    let normalizeHeaders = this.normalizeHeaders(headers);
    console.log('[Guardar plantilla] Headers normalizados:', normalizeHeaders);


    const normalizedMapping = this.normalizeMappingValues(mapping);
    const payload = { client_id: clientId, headers: normalizeHeaders, mapping: normalizedMapping };
    console.log('[Guardar plantilla] Payload enviado al API:', JSON.parse(JSON.stringify(payload)));
    this.importsService.createMapping(payload).subscribe({
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

  normalizeHeaders(headers: string[]): string[] {
    return headers.map((h) => this.normalizeHeaderValue(h));
  }

  /** Misma normalización que los headers: trim, toLowerCase y sin espacios. Para comparar o enviar un solo valor. */
  private normalizeHeaderValue(s: string): string {
    return (s ?? '').trim().toLowerCase().replace(/\s+/g, '');
  }

  /** Normaliza los valores del mapping (nombres de columna Excel) con la misma lógica que los headers: trim, toLowerCase y sin espacios internos. */
  private normalizeMappingValues(mapping: Record<string, string>): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(mapping)) {
      result[key] = this.normalizeHeaderValue(value ?? '');
    }
    return result;
  }

  /**
   * Genera una copia del Excel con la fila de cabeceras reemplazada por nuestra nomenclatura
   * (normalizada y con __1, __2 para duplicados), para que coincida con el mapping al subir la orden.
   */
  private buildExcelWithNormalizedHeaders(
    file: File,
    headerRowIndex: number,
    normalizedHeaders: string[]
  ): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = new Uint8Array(reader.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' }) as unknown[][];
          const originalHeaderRow = (rows[headerRowIndex] ?? []) as unknown[];
          const newHeaderRow: unknown[] = [...normalizedHeaders];
          while (newHeaderRow.length < originalHeaderRow.length) newHeaderRow.push('');
          rows[headerRowIndex] = newHeaderRow;
          const newSheet = XLSX.utils.aoa_to_sheet(rows as string[][]);
          workbook.Sheets[sheetName] = newSheet;
          const out = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
          const blob = new Blob([out], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          });
          resolve(new File([blob], file.name, { type: blob.type }));
        } catch (e) {
          reject(e);
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
  }

  /** Ejecuta la importación. Si no existe plantilla guardada, la guarda primero y luego ejecuta. */
  saveOrder(): void {
    if (this.orderLoading()) return;

    const clientId = this.storageService.getItem(LocalStorageEnums.ID);
    const file = this.currentExcelFile();
    const headers = this.excelHeaders();
    if (!clientId || !headers.length) {
      this.orderError.set('Debes cargar un Excel válido antes de guardar la orden.');
      return;
    }
    if (!file) {
      this.orderError.set('No hay archivo. Vuelve a cargar el Excel.');
      return;
    }

    const mapping = this.buildMapping();
    const validationError = this.validateRequiredMapping(mapping);
    if (validationError) {
      this.orderError.set(validationError);
      return;
    }

    this.orderError.set(null);
    this.orderResult.set(null);
    this.orderLoading.set(true);

    const companyId = this.companyId();
    const normalizedHeadersForExecution = this.normalizeHeaders(headers);
    console.log('[Guardar orden] Cabeceras del Excel que se envían (normalizadas, con __1/__2):', normalizedHeadersForExecution);

    const runExecution = (mappingId: string, fileToSend: File) =>
      this.importsService.executeExecution({
        file: fileToSend,
        client_id: clientId,
        mapping_id: mappingId,
        headers: normalizedHeadersForExecution,
        ...(companyId ? { company_id: companyId } : {}),
        skip_duplicates: true,
        run_async: true
      });

    const mappingId = this.mappingResult()?.mapping_id;
    const fileToSend$ = from(
      this.buildExcelWithNormalizedHeaders(file, this.headerRowIndex(), normalizedHeadersForExecution)
    );
    const request = fileToSend$.pipe(
      switchMap((modifiedFile) => {
        console.log('[Guardar orden] Archivo Excel generado con cabecera reemplazada. Cabeceras en el archivo:', normalizedHeadersForExecution);
        if (mappingId) {
          return runExecution(mappingId, modifiedFile);
        }
        const normalizedMapping = this.normalizeMappingValues(mapping);
        const payload = {
          client_id: clientId,
          headers: normalizedHeadersForExecution,
          mapping: normalizedMapping
        };
        console.log(
          '[Guardar orden → crear plantilla] Payload enviado al API:',
          JSON.parse(JSON.stringify(payload))
        );
        return this.importsService.createMapping(payload).pipe(
          switchMap((res) => {
            const id = res?.result?.mapping_id;
            if (!id) throw new Error('No se obtuvo mapping_id');
            this.mappingResult.set(res?.result ?? null);
            return runExecution(id, modifiedFile);
          })
        );
      })
    );

    request.subscribe({
      next: (res) => {
        this.orderLoading.set(false);
        const result = res?.result ?? null;
        this.orderResult.set(result ? { ...result } : null);
      },
      error: (err) => {
        this.orderLoading.set(false);
        const msg = err?.error?.errors?.[0] ?? err?.message ?? 'No se pudo ejecutar la importación.';
        this.orderError.set(typeof msg === 'string' ? msg : 'Error al guardar la orden.');
      }
    });
  }
}
