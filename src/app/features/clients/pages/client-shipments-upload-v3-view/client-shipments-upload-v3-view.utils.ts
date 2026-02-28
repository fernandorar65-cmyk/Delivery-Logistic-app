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

// --- Fechas para PostgreSQL (ISO YYYY-MM-DD) ---

/**
 * Convierte un valor de celda (número serial de Excel o texto de fecha) a formato
 * ISO YYYY-MM-DD que PostgreSQL acepta. Si no se puede parsear, devuelve el valor original como string.
 */
export function parseDateForPostgres(value: unknown): string {
  if (value === null || value === undefined) return '';
  const v = value;

  // Número: Excel serial (días desde 1900-01-01, con bug de año bisiesto de Excel)
  if (typeof v === 'number' && !Number.isNaN(v)) {
    const date = excelSerialToDate(v);
    if (date) return formatDateISO(date);
    return String(v);
  }

  // String: intentar parsear
  if (typeof v === 'string') {
    const s = v.trim();
    if (!s) return '';
    // Ya en formato ISO o que Date pueda interpretar
    const parsed = new Date(s);
    if (!Number.isNaN(parsed.getTime())) return formatDateISO(parsed);
    // Formatos comunes dd/mm/yyyy, dd-mm-yyyy, dd.mm.yyyy
    const dmy = matchDMY(s);
    if (dmy) return dmy;
    return s;
  }

  return String(v);
}

/** Excel serial (días desde 1900-01-01) a Date. Ajuste por bug de Excel (1900 bisiesto): serial >= 60 restamos 1 día. */
function excelSerialToDate(serial: number): Date | null {
  if (serial < 1) return null;
  const n = Math.floor(serial);
  const offset = n >= 60 ? n - 2 : n - 1;
  const ms = new Date(1900, 0, 1).getTime() + offset * 86400000;
  return new Date(ms);
}

function formatDateISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Intenta extraer día/mes/año de formatos dd/mm/yyyy, dd-mm-yyyy, dd.mm.yyyy. */
function matchDMY(s: string): string | null {
  const cleaned = s.replace(/\s+/g, ' ').trim();
  const parts = cleaned.split(/[/\-.]/);
  if (parts.length !== 3) return null;
  const [a, b, c] = parts.map((p) => parseInt(p, 10));
  if (Number.isNaN(a) || Number.isNaN(b) || Number.isNaN(c)) return null;
  let day: number;
  let month: number;
  let year: number;
  if (c > 31) {
    year = c;
    if (a > 12) {
      day = a;
      month = b;
    } else if (b > 12) {
      day = b;
      month = a;
    } else {
      return null;
    }
  } else if (a > 31 || b > 31) {
    return null;
  } else if (a > 12) {
    day = a;
    month = b;
    year = c > 100 ? c : c + 2000;
  } else if (b > 12) {
    day = b;
    month = a;
    year = c > 100 ? c : c + 2000;
  } else {
    day = a;
    month = b;
    year = c > 100 ? c : c + 2000;
  }
  const d = new Date(year, month - 1, day);
  if (Number.isNaN(d.getTime())) return null;
  return formatDateISO(d);
}

// --- Horas para PostgreSQL (HH:MM:SS) ---

/**
 * Convierte un valor de celda (fracción de día de Excel o texto de hora) a formato
 * HH:MM:SS que PostgreSQL acepta para tipo time. Si no se puede parsear, devuelve el valor original como string.
 */
export function parseTimeForPostgres(value: unknown): string {
  if (value === null || value === undefined) return '';
  const v = value;

  // Número: Excel guarda la hora como fracción de día (0 = 00:00, 0.5 = 12:00)
  if (typeof v === 'number' && !Number.isNaN(v)) {
    const fraction = v >= 0 && v < 1 ? v : v - Math.floor(v);
    const totalSeconds = Math.round(fraction * 86400);
    const h = Math.floor(totalSeconds / 3600) % 24;
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  // String: si ya es HH:MM o HH:MM:SS, normalizar a HH:MM:SS
  if (typeof v === 'string') {
    const s = v.trim();
    if (!s) return '';
    const timeMatch = s.match(/^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?/);
    if (timeMatch) {
      const h = Math.min(23, Math.max(0, parseInt(timeMatch[1], 10)));
      const m = Math.min(59, Math.max(0, parseInt(timeMatch[2], 10)));
      const sec = timeMatch[3] != null ? Math.min(59, Math.max(0, parseInt(timeMatch[3], 10))) : 0;
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    }
    return s;
  }

  return String(v);
}
