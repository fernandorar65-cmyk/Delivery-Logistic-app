export interface InternalClient {
  id?: string;
  email: string;
  role?: string;
  name?: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
}

export interface InternalClientCreate {
  email: string;
  password: string;
}

export interface InternalClientUpdate {
  email?: string;
  password?: string;
}

