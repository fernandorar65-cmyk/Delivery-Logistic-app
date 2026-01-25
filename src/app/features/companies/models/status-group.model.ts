export interface StatusGroupCreate {
  name: string;
}

export interface StatusGroup {
  id?: string;
  company_id?: string;
  company_name?: string;
  name?: string;
  statuses_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface StatusGroupResponse {
  errors: any[];
  result: StatusGroup | null;
}

export interface StatusGroupListResponse {
  errors: any[];
  result: StatusGroup[];
  pagination?: {
    count: number;
    next: string | null;
    previous: string | null;
  };
}
