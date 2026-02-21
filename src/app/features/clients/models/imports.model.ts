/** Claves estándar del mapeo (API) → nombre de columna en el Excel del cliente. */
export type ImportMappingRecord = Record<string, string>;

/** Resultado de POST /imports/mappings/detect/ */
export interface ImportMappingDetectResult {
  mapping_id: string;
  mapping: ImportMappingRecord;
}

export interface ImportMappingCreateRequest {
  client_id: string;
  headers: string[];
  mapping: ImportMappingRecord;
}

/** Resultado de POST /imports/mappings/ (crear template). */
export interface ImportMappingCreateResult {
  mapping_id: string;
  mapping?: ImportMappingRecord;
}

export interface ImportMappingCreateResponse {
  errors: unknown[];
  result?: ImportMappingCreateResult | null;
}

/** Respuesta de POST /imports/executions/ (ejecución síncrona) */
export interface ImportExecutionResult {
  execution_id: string;
  status: 'completed' | 'processing' | 'failed';
  total_rows?: number;
  success_rows?: number;
  error_rows?: number;
  row_errors?: Array<{ row_number: number; field: string; message: string }>;
}

export interface ImportExecutionResponse {
  errors: unknown[];
  result?: ImportExecutionResult | null;
}








// ORDENAR ESTA MRD DESPUES




/**  GET DETECT MAPPING **/
export interface ImportMappingDetectRequest {
  client_id: string;
  headers: string[];
}

/** **/


export interface ImportMappingDetectResponse {
  errors: unknown[];
  result?: ImportMappingDetectResult | null;
}