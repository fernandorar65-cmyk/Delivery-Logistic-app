import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import {
  ImportMappingCreateRequest,
  ImportMappingCreateResponse,
  ImportMappingDetectRequest,
  ImportMappingDetectResponse
} from '@app/features/clients/models/imports.model';

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
}
