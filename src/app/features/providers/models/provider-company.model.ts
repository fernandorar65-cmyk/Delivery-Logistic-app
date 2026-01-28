export interface ProviderCompany {
  id: string;
  company_id: string;
  company_name: string;
  provider_id: string;
  provider_name: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProviderCompanyListResponse {
  errors: any[];
  result: ProviderCompany[];
  pagination?: {
    count: number;
    next: string | null;
    previous: string | null;
  };
}
