export interface Internal {
  id?: number;
  email?: string;
  name?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface InternalCreate {
  email: string;
  password: string;
}

export interface InternalUpdate {
  name?: string;
  description?: string;
}

