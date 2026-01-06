export interface Client {
  id?: string;
  email: string;
  business_name: string;
  ruc: string;
  phone_number?: string | null;
  contact_phone?: string | null;
  is_active?: boolean;
  created_at?: string;
  user?: string;
}

export interface ClientCreate {
  email: string;
  password: string;
  business_name: string;
  ruc: string;
}

export interface ClientUpdate {
  email?: string;
  password?: string;
  business_name?: string;
  ruc?: string;
}

