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

export interface StatusGroupStateCreate {
  name: string;
  code: string;
  order: number;
  is_initial: boolean;
  is_final: boolean;
  is_visible_to_client: boolean;
  is_visible_to_provider: boolean;
}

export interface StatusGroupState {
  id?: string;
  status_group_id?: string;
  name?: string;
  code?: string;
  order?: number;
  is_initial?: boolean;
  is_final?: boolean;
  is_visible_to_client?: boolean;
  is_visible_to_provider?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface StatusGroupStateResponse {
  errors: any[];
  result: StatusGroupState | null;
}

export interface StatusGroupStateListResponse {
  errors: any[];
  result: StatusGroupState[];
  pagination?: {
    count: number;
    next: string | null;
    previous: string | null;
  };
}
