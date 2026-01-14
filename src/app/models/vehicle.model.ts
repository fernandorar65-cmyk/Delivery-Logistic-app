export interface Vehicle {
  id?: string;
  license_plate: string;
  vehicle_type: 'truck' | 'van' | 'motorcycle' | 'tractor-trailer';
  model?: string;
  brand?: string;
  capacity?: string;
  provider_id?: string;
  provider_name?: string;
  status: 'available' | 'in_route' | 'maintenance' | 'inactive';
  created_at?: string;
  
  // Campos adicionales para el diseño (no vienen del API)
  image?: string;
  year?: number;
}

export interface VehicleCreate {
  license_plate: string;
  vehicle_type: 'truck' | 'van' | 'motorcycle' | 'tractor-trailer';
  model?: string;
  brand?: string;
  capacity?: string;
  provider_id?: string;
  status?: 'available' | 'in_route' | 'maintenance' | 'inactive';
}

export interface VehicleListResponse {
  errors: any[];
  result: Vehicle[];
  pagination: {
    count: number;
    next: string | null;
    previous: string | null;
  };
}

export interface VehicleResponse {
  errors: any[];
  result: Vehicle;
}

export interface VehicleUpdate {
  license_plate?: string;
  vehicle_type?: 'truck' | 'van' | 'motorcycle' | 'tractor-trailer';
  model?: string;
  brand?: string;
  capacity?: string;
  provider_id?: string;
  status?: 'available' | 'in_route' | 'maintenance' | 'inactive';
}
