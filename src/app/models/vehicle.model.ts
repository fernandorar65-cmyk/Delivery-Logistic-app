export interface Vehicle {
  id?: string;
  license_plate: string;
  vehicle_type: 'truck' | 'van' | 'motorcycle' | 'tractor-trailer';
  model?: string;
  brand?: string;
  color?: string;
  body_type?: string;
  tara_kg?: string | number;
  gross_weight_kg?: string | number;
  net_capacity_kg?: string | number;
  length_m?: string | number;
  width_m?: string | number;
  height_m?: string | number;
  capacity?: string;
  provider_id?: string;
  provider_name?: string;
  status: 'available' | 'in_route' | 'maintenance' | 'inactive';
  created_at?: string;
  updated_at?: string;
  
  // Campos adicionales para el diseño (no vienen del API)
  image?: string;
  year?: number;
}

export interface VehicleCreate {
  license_plate: string;
  vehicle_type: 'truck' | 'van' | 'motorcycle' | 'tractor-trailer';
  model?: string;
  brand?: string;
  color?: string;
  year?: number;
  body_type?: string;
  tara_kg?: string | number;
  gross_weight_kg?: string | number;
  net_capacity_kg?: string | number;
  length_m?: string | number;
  width_m?: string | number;
  height_m?: string | number;
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
  color?: string;
  year?: number;
  body_type?: string;
  tara_kg?: string | number;
  gross_weight_kg?: string | number;
  net_capacity_kg?: string | number;
  length_m?: string | number;
  width_m?: string | number;
  height_m?: string | number;
  capacity?: string;
  provider_id?: string;
  status?: 'available' | 'in_route' | 'maintenance' | 'inactive';
}

export interface VehicleApi {
  id?: string;
  provider_id?: string;
  provider_name?: string;
  plate_number: string;
  brand?: string;
  model?: string;
  color?: string;
  year?: number;
  vehicle_type: string;
  body_type?: string;
  tara_kg?: string | number;
  gross_weight_kg?: string | number;
  net_capacity_kg?: string | number;
  length_m?: string | number;
  width_m?: string | number;
  height_m?: string | number;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface VehicleApiListResponse {
  errors: any[];
  result: VehicleApi[];
  pagination?: {
    count: number;
    next: string | null;
    previous: string | null;
  };
}

export interface VehicleApiResponse {
  errors: any[];
  result: VehicleApi;
}
