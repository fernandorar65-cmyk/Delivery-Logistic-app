export interface Operation {
  id?: string;
  name: string;
  description: string;
  is_active: boolean;
  is_finalized: boolean;
  driver: string;
  created_at?: string;
  updated_at?: string;
}

export interface OperationCreate {
  name: string;
  description: string;
  is_active: boolean;
  is_finalized: boolean;
  driver: string;
}

export interface OperationUpdate {
  name?: string;
  description?: string;
  is_active?: boolean;
  is_finalized?: boolean;
  driver?: string;
}

