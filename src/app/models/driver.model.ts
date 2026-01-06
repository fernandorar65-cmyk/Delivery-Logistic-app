export interface Driver {
  id?: number;
  name: string;
  email: string;
  phone?: string;
  license_number?: string;
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

