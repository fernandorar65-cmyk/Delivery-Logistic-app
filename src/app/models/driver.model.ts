export interface Driver {
  id?: string;
  email: string;
  first_name: string;
  last_name: string;
  license_number: string;
  is_active?: boolean;
  user?: string;
  phone?: string;
  vehicle_type?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DriverCreate {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  license_number: string;
}

export interface DriverUpdate {
  email?: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  license_number?: string;
}

