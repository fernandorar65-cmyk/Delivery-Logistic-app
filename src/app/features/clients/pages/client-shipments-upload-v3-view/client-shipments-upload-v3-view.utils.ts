/**
 * Utilidades puras para el flujo de carga de órdenes por Excel (V3).
 * Sin dependencias de Angular ni efectos secundarios; fáciles de testear.
 */

import type { StandardSection } from './client-shipments-upload-v3-view.constants';
import { REQUIRED_ADDRESS_KEYS, REQUIRED_MAPPING_KEYS } from './client-shipments-upload-v3-view.constants';

// --- Normalización (trim, toLowerCase, sin espacios) ---

export function normalizeHeaderValue(s: string): string {
  return (s ?? '').trim().toLowerCase().replace(/\s+/g, '');
}

export function normalizeHeaders(headers: string[]): string[] {
  return headers.map(normalizeHeaderValue);
}

export function normalizeMappingValues(mapping: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(mapping)) {
    result[key] = normalizeHeaderValue(value ?? '');
  }
  return result;
}

/** Para búsqueda/filtrado: NFD, quita acentos, toLowerCase, trim. */
export function normalizeForSearch(v: string): string {
  return (v ?? '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/** Duplicados → sufijos __1, __2. */
export function disambiguateDuplicateHeaders(rawHeaders: string[]): string[] {
  const normalizedCounts = new Map<string, number>();
  rawHeaders.forEach((h) => {
    const n = normalizeForSearch(h);
    normalizedCounts.set(n, (normalizedCounts.get(n) ?? 0) + 1);
  });

  const occurrenceIndex = new Map<string, number>();
  return rawHeaders.map((h) => {
    const n = normalizeForSearch(h);
    const total = normalizedCounts.get(n) ?? 1;
    if (total <= 1) return h;
    const idx = (occurrenceIndex.get(n) ?? 0) + 1;
    occurrenceIndex.set(n, idx);
    return `${h}__${idx}`;
  });
}

// --- Excel: detección de fila de cabeceras ---

export function findHeaderRowIndex(
  rows: string[][],
  minHeaderColumns: number
): number | null {
  if (!rows?.length) return null;
  for (let i = 0; i <= 2 && i < rows.length; i++) {
    const row = rows[i] ?? [];
    const nonEmpty = row
      .map((v: unknown) => String(v).trim())
      .filter((v: string) => Boolean(v));
    if (nonEmpty.length >= minHeaderColumns) return i;
  }
  return null;
}

// --- Mapping y validación ---

export function buildMappingFromSelections(
  selectedMappings: Record<string, string>,
  standardSections: StandardSection[]
): Record<string, string> {
  const mapping: Record<string, string> = {};
  standardSections.forEach((s) =>
    s.fields.forEach((f) => {
      mapping[f.apiKey] = selectedMappings[f.id] ?? 'Opcional';
    })
  );
  return mapping;
}

export function validateRequiredMapping(mapping: Record<string, string>): string | null {
  const hasValue = (v: string) => v && v !== 'Opcional';
  for (const key of REQUIRED_MAPPING_KEYS) {
    if (!hasValue(mapping[key])) {
      const label = key === 'order.tracking_number' ? 'N° de guía' : 'Fecha de solicitud';
      return `Falta mapear el campo obligatorio: ${label} (${key}). Asigna una columna del Excel.`;
    }
  }
  const hasAddress = REQUIRED_ADDRESS_KEYS.some((key) => hasValue(mapping[key]));
  if (!hasAddress) {
    return 'Debes mapear al menos una dirección: Dirección de recojo o Dirección (Entrega).';
  }
  return null;
}

export function getApiKeyToFieldIdMap(standardSections: StandardSection[]): Record<string, string> {
  const map: Record<string, string> = {};
  standardSections.forEach((s) =>
    s.fields.forEach((f) => {
      map[f.apiKey] = f.id;
    })
  );
  return map;
}
