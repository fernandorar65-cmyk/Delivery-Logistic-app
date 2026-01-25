export interface StatusGroupCreate {
  name: string;
}

export interface StatusGroup {
  id?: string;
  name?: string;
  company_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface StatusGroupResponse {
  errors: any[];
  result: StatusGroup | null;
}
