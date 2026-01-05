export interface OperationStatus {
  id?: number;
  operation_id?: number;
  status: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface OperationStatusCreate {
  status: string;
  notes?: string;
}

export interface OperationStatusUpdate {
  status?: string;
  notes?: string;
}

