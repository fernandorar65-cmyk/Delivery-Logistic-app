export interface Operation {
  id?: number;
  name: string;
  description?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface OperationCreate {
  name: string;
  description?: string;
  status?: string;
}

export interface OperationUpdate {
  name?: string;
  description?: string;
  status?: string;
}

