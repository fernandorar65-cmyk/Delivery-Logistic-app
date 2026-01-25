export interface CompanyClientMatch {
  id: string;
  company_id: string;
  company_name: string;
  client_id: string;
  client_name: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface CompanyClientMatchListResponse {
  errors: any[];
  result: CompanyClientMatch[];
  pagination?: {
    count: number;
    next: string | null;
    previous: string | null;
  };
}
