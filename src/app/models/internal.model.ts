export interface Internal {
  id?: number;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface InternalCreate {
  name: string;
  description?: string;
}

export interface InternalUpdate {
  name?: string;
  description?: string;
}

