export interface ImportMappingDetectRequest {
  client_id: string;
  headers: string[];
}

export interface ImportMappingDetectResponse {
  errors: unknown[];
  result?: unknown;
}
