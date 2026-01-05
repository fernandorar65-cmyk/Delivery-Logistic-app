export interface Client {
  id?: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ClientCreate {
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface ClientUpdate {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

