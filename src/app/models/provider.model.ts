export interface Provider {
  id?: string;
  provider_name: string;
  ruc: string;
  description?: string;
  created_at?: string;
  user_id?: string;
  user_email?: string;
  user_type?: string;
  
  // Campos adicionales para el diseño (no vienen del API)
  status?: 'active' | 'inactive' | 'pending';
  trucks?: number;
  motorcycles?: number;
  drivers?: number;
  driverAvatars?: string[];
  zone?: string;
  rating?: number | null;
  logo?: string;
  initials?: string;
}

export interface ProviderCreate {
  provider_name: string;
  ruc: string;
  description?: string;
  email: string;
  password: string;
}

export interface ProviderListResponse {
  errors: any[];
  result: Provider[];
  pagination: {
    count: number;
    next: string | null;
    previous: string | null;
  };
}

export interface ProviderResponse {
  errors: any[];
  result: Provider;
}

export interface ProviderUpdate {
  provider_name?: string;
  ruc?: string;
  description?: string;
  email?: string;
  password?: string;
}
