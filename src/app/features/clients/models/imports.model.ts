export interface ImportMappingDetectRequest {
  client_id: string;
  headers: string[];
}

export interface ImportMappingDetectResponse {
  errors: unknown[];
  result?: unknown;
}

export interface ImportMappingCreateRequest {
  client_id: string;
  headers: string[];
  mapping: Record<string, string>;
}

export interface ImportMappingCreateResponse {
  errors: unknown[];
  result?: unknown;
}
