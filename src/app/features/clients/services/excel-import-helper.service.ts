import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import {
  findHeaderRowIndex,
  parseDateForPostgres,
  parseTimeForPostgres
} from '../pages/client-shipments-upload-v3-view/client-shipments-upload-v3-view.utils';

export interface ParseExcelSuccess {
  headerRowIndex: number;
  headers: string[];
}

export interface ParseExcelError {
  error: string;
}

export type ParseExcelResult = ParseExcelSuccess | ParseExcelError;

/**
 * Servicio para lectura y transformación de archivos Excel en el flujo de importación.
 * Capa de infraestructura: I/O de archivos (XLSX).
 */
@Injectable({
  providedIn: 'root'
})
export class ExcelImportHelperService {
  /**
   * Lee el Excel y extrae la fila de cabeceras (desambiguada).
   * processHeaders(rawHeaders) debe devolver las cabeceras ya normalizadas/desambiguadas.
   */
  async parseExcelFile(
    file: File,
    minHeaderColumns: number,
    processHeaders: (rawHeaders: string[]) => string[]
  ): Promise<ParseExcelResult> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = new Uint8Array(reader.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const rows = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: ''
          }) as string[][];

          const headerRowIndex = findHeaderRowIndex(rows, minHeaderColumns);
          if (headerRowIndex === null) {
            resolve({
              error: `No se encontró una fila de cabeceras válida en las primeras 3 filas del Excel. Se espera al menos ${minHeaderColumns} columnas con nombre. Revisa el archivo e intenta de nuevo.`
            });
            return;
          }

          const headerRow = rows[headerRowIndex] ?? [];
          const rawHeaders = headerRow
            .map((v: unknown) => String(v).trim())
            .filter((v: string) => Boolean(v));
          const headers = processHeaders(rawHeaders);

          resolve({ headerRowIndex, headers });
        } catch {
          resolve({ error: 'No se pudo leer el archivo. Verifica el formato.' });
        }
      };
      reader.onerror = () => {
        resolve({ error: 'No se pudo leer el archivo. Intenta nuevamente.' });
      };
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Genera el Excel que se enviará al backend. El backend exige que la **primera fila**
   * sea la de cabeceras; en el archivo del usuario las cabeceras pueden estar en una fila
   * inferior (p. ej. fila 2 si hay títulos arriba). Por eso eliminamos todas las filas
   * por encima de la fila de cabeceras detectada: así la fila 0 del archivo generado
   * es siempre la de headers y el resto son registros.
   * Además reemplaza la cabecera por la normalizada y formatea fechas/horas para PostgreSQL.
   */
  async buildExcelWithNormalizedHeaders(
    file: File,
    headerRowIndex: number,
    normalizedHeaders: string[],
    dateColumnNames: Set<string> = new Set(),
    timeColumnNames: Set<string> = new Set()
  ): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = new Uint8Array(reader.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const rows = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: ''
          }) as unknown[][];

          // Eliminar filas por encima de la cabecera: el archivo enviado tendrá fila 0 = headers.
          const rowsFromHeader = rows.slice(headerRowIndex) as unknown[][];
          const originalHeaderRow = (rowsFromHeader[0] ?? []) as unknown[];
          const newHeaderRow: unknown[] = [...normalizedHeaders];
          while (newHeaderRow.length < originalHeaderRow.length) newHeaderRow.push('');

          rowsFromHeader[0] = newHeaderRow;

          const needFormat = dateColumnNames.size > 0 || timeColumnNames.size > 0;
          if (needFormat) {
            for (let r = 1; r < rowsFromHeader.length; r++) {
              const row = rowsFromHeader[r] as unknown[];
              for (let c = 0; c < normalizedHeaders.length && c < row.length; c++) {
                const header = normalizedHeaders[c];
                if (dateColumnNames.has(header)) {
                  row[c] = parseDateForPostgres(row[c]);
                } else if (timeColumnNames.has(header)) {
                  row[c] = parseTimeForPostgres(row[c]);
                }
              }
            }
          }

          const newSheet = XLSX.utils.aoa_to_sheet(rowsFromHeader as string[][]);
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
}
