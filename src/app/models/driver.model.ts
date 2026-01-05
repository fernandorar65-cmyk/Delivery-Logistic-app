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
  name: string;
  email: string;
  phone?: string;
  license_number?: string;
  vehicle_type?: string;
}

export interface DriverUpdate {
  name?: string;
  email?: string;
  phone?: string;
  license_number?: string;
  vehicle_type?: string;
}

