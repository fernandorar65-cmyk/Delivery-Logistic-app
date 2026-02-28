import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { from, switchMap } from 'rxjs';
import { ImportsService } from '@app/features/clients/services/imports.service';
import { ExcelImportHelperService } from '@app/features/clients/services/excel-import-helper.service';
import { StorageService } from '@app/core/storage/storage.service';
import { LocalStorageEnums } from '@app/shared/models/local.storage.enums';
import {
  ImportExecutionResult,
  ImportMappingCreateResult,
  ImportMappingDetectResult
} from '@app/features/clients/models/imports.model';
import { ModalComponent } from '@app/shared/ui/modal/modal.component';

import {
  STANDARD_SECTIONS,
  MIN_HEADER_COLUMNS,
  SECTION_TITLE_SHORT,
  DATE_API_KEYS,
  TIME_API_KEYS,
  type StandardSection
} from './client-shipments-upload-v3-view.constants';
import {
  normalizeHeaders,
  normalizeHeaderValue,
  normalizeMappingValues,
  normalizeForSearch,
  disambiguateDuplicateHeaders,
  buildMappingFromSelections,
  validateRequiredMapping,
  getApiKeyToFieldIdMap
} from './client-shipments-upload-v3-view.utils';

@Component({
  selector: 'app-client-shipments-upload-v3-view',
  standalone: true,
  imports: [CommonModule, ModalComponent, RouterLink],
  templateUrl: './client-shipments-upload-v3-view.component.html',
  styleUrl: './client-shipments-upload-v3-view.component.css'
})
export class ClientShipmentsUploadV3ViewComponent {
  private importsService = inject(ImportsService);
  private excelHelper = inject(ExcelImportHelperService);
  private storageService = inject(StorageService);
  private route = inject(ActivatedRoute);

  // ─── Estado de la UI ─────────────────────────────────────────────────────
  companyId = signal<string | null>(null);
  openSelectId = signal<string | null>(null);
  excelHeaders = signal<string[]>([]);
  excelFileName = signal<string | null>(null);
  currentExcelFile = signal<File | null>(null);
  excelError = signal<string | null>(null);
  searchText = signal<Record<string, string>>({});
  headerRowIndex = signal<number>(0);

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

  // ─── Configuración (constantes) ───────────────────────────────────────────
  readonly standardSections: StandardSection[] = STANDARD_SECTIONS;
  selectedMappings = signal<Record<string, string>>({});

  constructor() {
    this.route.queryParams.subscribe((params) => {
      const id = params['company_id'];
      this.companyId.set(typeof id === 'string' && id.length > 0 ? id : null);
    });
  }

  // ─── Reset y descartar ────────────────────────────────────────────────────

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

  // ─── Carga de Excel ───────────────────────────────────────────────────────

  async onExcelFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0];
    if (!file) return;

    this.excelError.set(null);
    this.excelFileName.set(file.name);
    this.currentExcelFile.set(file);
    this.orderResult.set(null);

    const processHeaders = (raw: string[]) => {
      const normalized = raw.map((h) => h.trim().toLowerCase());
      return disambiguateDuplicateHeaders(normalized);
    };

    const result = await this.excelHelper.parseExcelFile(
      file,
      MIN_HEADER_COLUMNS,
      processHeaders
    );

    if ('error' in result) {
      if (result.error.includes('No se encontró')) {
        this.headerErrorMessage.set(result.error);
        this.showHeaderErrorModal.set(true);
        this.excelHeaders.set([]);
        this.currentExcelFile.set(null);
        this.excelFileName.set(null);
      } else {
        this.excelError.set(result.error);
      }
      return;
    }

    this.headerRowIndex.set(result.headerRowIndex);
    this.excelHeaders.set(result.headers);
    this.detectTemplate(result.headers);
  }

  closeHeaderErrorModal(): void {
    this.showHeaderErrorModal.set(false);
    this.headerErrorMessage.set(null);
  }

  // ─── Detección y aplicación de plantilla ──────────────────────────────────

  private detectTemplate(headers: string[]): void {
    const clientId = this.storageService.getItem(LocalStorageEnums.ID);
    if (!clientId || !headers.length) return;

    this.templateError.set(null);
    const normalizedHeaders = normalizeHeaders(headers);
    this.importsService
      .detectMapping({ client_id: clientId, headers: normalizedHeaders })
      .subscribe({
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
    const apiKeyToFieldId = getApiKeyToFieldIdMap(this.standardSections);
    const headers = this.excelHeaders();
    const next: Record<string, string> = {};

    Object.entries(result.mapping).forEach(([apiKey, excelHeaderName]) => {
      const fieldId = apiKeyToFieldId[apiKey];
      if (!fieldId) return;
      const match = headers.find(
        (h) => normalizeHeaderValue(h) === normalizeHeaderValue(excelHeaderName)
      );
      if (match) next[fieldId] = match;
    });

    this.selectedMappings.update((prev) => ({ ...prev, ...next }));
  }

  closeTemplateDetectedModal(): void {
    this.showTemplateDetectedModal.set(false);
  }

  // ─── UI del mapeo (dropdown, selección, progreso) ───────────────────────────

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
    const query = normalizeForSearch(this.getSearchValue(fieldId));
    if (!query) return options;
    return options.filter((o) => normalizeForSearch(o).includes(query));
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
    return Object.values(this.selectedMappings()).filter(
      (v) => v && v !== 'Opcional'
    ).length;
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
    return SECTION_TITLE_SHORT[id] ?? id;
  }

  // ─── Guardar plantilla ────────────────────────────────────────────────────

  createTemplate(): void {
    if (this.mappingLoading()) return;

    const clientId = this.storageService.getItem(LocalStorageEnums.ID);
    const headers = this.excelHeaders();
    if (!clientId || !headers.length) {
      this.mappingError.set('Debes cargar un Excel válido antes de guardar.');
      return;
    }

    const mapping = buildMappingFromSelections(
      this.selectedMappings(),
      this.standardSections
    );
    const validationError = validateRequiredMapping(mapping);
    if (validationError) {
      this.mappingError.set(validationError);
      return;
    }

    this.mappingError.set(null);
    this.mappingLoading.set(true);

    const normalizedHeaders = normalizeHeaders(headers);
    const normalizedMapping = normalizeMappingValues(mapping);
    const payload = {
      client_id: clientId,
      headers: normalizedHeaders,
      mapping: normalizedMapping
    };
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

  // ─── Guardar orden ────────────────────────────────────────────────────────

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

    const mapping = buildMappingFromSelections(
      this.selectedMappings(),
      this.standardSections
    );
    const validationError = validateRequiredMapping(mapping);
    if (validationError) {
      this.orderError.set(validationError);
      return;
    }

    this.orderError.set(null);
    this.orderResult.set(null);
    this.orderLoading.set(true);

    const companyId = this.companyId();
    const normalizedHeadersForExecution = normalizeHeaders(headers);
    console.log(
      '[Guardar orden] Cabeceras del Excel que se envían (normalizadas, con __1/__2):',
      normalizedHeadersForExecution
    );

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
    const dateColumnNames = new Set<string>();
    for (const apiKey of DATE_API_KEYS) {
      const col = mapping[apiKey];
      if (col && col !== 'Opcional') dateColumnNames.add(normalizeHeaderValue(col));
    }
    const timeColumnNames = new Set<string>();
    for (const apiKey of TIME_API_KEYS) {
      const col = mapping[apiKey];
      if (col && col !== 'Opcional') timeColumnNames.add(normalizeHeaderValue(col));
    }
    const fileToSend$ = from(
      this.excelHelper.buildExcelWithNormalizedHeaders(
        file,
        this.headerRowIndex(),
        normalizedHeadersForExecution,
        dateColumnNames,
        timeColumnNames
      )
    );

    const request = fileToSend$.pipe(
      switchMap((modifiedFile) => {
        console.log(
          '[Guardar orden] Archivo Excel generado con cabecera reemplazada. Cabeceras en el archivo:',
          normalizedHeadersForExecution
        );
        if (mappingId) {
          return runExecution(mappingId, modifiedFile);
        }
        const normalizedMapping = normalizeMappingValues(mapping);
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
        const msg =
          err?.error?.errors?.[0] ?? err?.message ?? 'No se pudo ejecutar la importación.';
        this.orderError.set(typeof msg === 'string' ? msg : 'Error al guardar la orden.');
      }
    });
  }
}
