export interface Client {
  id?: string;
  client_name: string;
  ruc: string;
  description?: string;
  email: string;
  phone_number?: string | null;
  contact_phone?: string | null;
  created_at?: string;
  user_id?: string;
  user_email?: string;
  user_type?: string;
  match_status?: string;
}

export interface ClientCreate {
  client_name: string;
  email: string;
  password: string;
  ruc: string;
  description?: string;
}

export interface ClientUpdate {
  client_name?: string;
  email?: string;
  password?: string;
  ruc?: string;
  description?: string;
}

export interface ClientListResponse {
  errors: any[];
  result: Client[];
  pagination?: {
    count: number;
    next: string | null;
    previous: string | null;
  };
}

export interface ClientResponse {
  errors: any[];
  result: Client;
}







