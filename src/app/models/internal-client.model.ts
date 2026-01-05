export interface InternalClient {
  id?: number;
  name: string;
  email: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
}

export interface InternalClientCreate {
  name: string;
  email: string;
  phone?: string;
}

export interface InternalClientUpdate {
  name?: string;
  email?: string;
  phone?: string;
}

