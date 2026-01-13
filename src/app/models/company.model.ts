export interface Company {
  id?: string;
  company_name: string;
  ruc: string;
  description?: string;
  created_at?: string;
  user_id?: string;
  user_email?: string;
  user_type?: string;
}

export interface CompanyCreate {
  company_name: string;
  ruc: string;
  description?: string;
  email: string;
  password: string;
}

export interface CompanyListResponse {
  errors: any[];
  result: Company[];
  pagination: {
    count: number;
    next: string | null;
    previous: string | null;
  };
}

export interface CompanyUpdate {
  company_name?: string;
  ruc?: string;
  description?: string;
  email?: string;
  password?: string;
}
