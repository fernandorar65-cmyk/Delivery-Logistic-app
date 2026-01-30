export interface CompanyClientMatchRequest {
  company_id: string;
  client_id: string;
}

export interface CompanyClientMatchResponse {
  errors: any[];
  result?: unknown;
}
