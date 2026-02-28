import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { findHeaderRowIndex } from '../pages/client-shipments-upload-v3-view/client-shipments-upload-v3-view.utils';

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
   * Genera una copia del Excel con la fila de cabeceras reemplazada y colocada como
   * primera fila (índice 0). El backend espera que la primera fila del archivo
   * sean las cabeceras; si en el Excel original las cabeceras estaban en fila 1 o 2
   * (con títulos de sección arriba), se eliminan esas filas para que la cabecera
   * quede en la fila 0.
   */
  async buildExcelWithNormalizedHeaders(
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
          const rows = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: ''
          }) as unknown[][];

          const originalHeaderRow = (rows[headerRowIndex] ?? []) as unknown[];
          const newHeaderRow: unknown[] = [...normalizedHeaders];
          while (newHeaderRow.length < originalHeaderRow.length) newHeaderRow.push('');

          // Dejar solo desde la fila de cabeceras hacia abajo, con la cabecera en posición 0
          const rowsFromHeader = rows.slice(headerRowIndex) as unknown[][];
          rowsFromHeader[0] = newHeaderRow;

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
