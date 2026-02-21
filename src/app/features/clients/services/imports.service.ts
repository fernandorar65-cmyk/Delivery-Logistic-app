import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import {
  ImportMappingCreateRequest,
  ImportMappingCreateResponse,
  ImportMappingDetectRequest,
  ImportMappingDetectResponse,
  ImportExecutionResponse
} from '@app/features/clients/models/imports.model';

export interface ImportExecutionParams {
  file: File;
  client_id: string;
  mapping_id: string;
  company_id?: string;
  skip_duplicates?: boolean;
  run_async?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ImportsService {
  private http = inject(HttpClient);

  detectMapping(payload: ImportMappingDetectRequest): Observable<ImportMappingDetectResponse> {
    return this.http.post<ImportMappingDetectResponse>(`${environment.apiUrl}/imports/mappings/detect/`, payload);
  }

  createMapping(payload: ImportMappingCreateRequest): Observable<ImportMappingCreateResponse> {
    return this.http.post<ImportMappingCreateResponse>(`${environment.apiUrl}/imports/mappings/`, payload);
  }

  /**
   * Ejecuta la importación: envía el archivo Excel y el mapping_id.
   * POST /api/v1/imports/executions/ (multipart/form-data)
   */
  executeExecution(params: ImportExecutionParams): Observable<ImportExecutionResponse> {
    const form = new FormData();
    form.append('file', params.file, params.file.name);
    form.append('client_id', params.client_id);
    form.append('mapping_id', params.mapping_id);
    if (params.company_id != null) form.append('company_id', params.company_id);
    if (params.skip_duplicates != null) form.append('skip_duplicates', String(params.skip_duplicates));
    if (params.run_async != null) form.append('run_async', String(params.run_async));

    return this.http.post<ImportExecutionResponse>(
      `${environment.apiUrl}/imports/executions/`,
      form
    );
  }
}
