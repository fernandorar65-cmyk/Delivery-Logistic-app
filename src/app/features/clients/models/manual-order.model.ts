/**
 * Tipos para creación manual de orden.
 * POST /api/v1/orders/
 */

export type ManualOrderSize = 'XXS' | 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'CUSTOM';

export interface ManualOrderStop {
  contact_name: string;
  contact_phone: string;
  address: string;
  reference: string;
  country: string;
  department: string;
  province: string;
  district: string;
  latitude?: string;
  longitude?: string;
}

export interface ManualOrderPackage {
  description: string;
  quantity: number;
  size: ManualOrderSize;
  weight_kg: string;
  height_cm: string;
  width_cm: string;
  length_cm: string;
  volumetric_weight?: string;
  m3?: string;
}

export interface ManualOrderCreatePayload {
  company_id: string;
  client_id: string;
  tracking_number: string;
  request_date: string;
  pickup_date: string;
  pickup_date_from: string;
  pickup_date_to: string;
  estimated_value: string;
  observations?: string;
  pickup: ManualOrderStop;
  delivery: ManualOrderStop;
  packages: ManualOrderPackage[];
}

export interface ManualOrderCreateResponse {
  errors: Array<{ field?: string; code?: string; detail?: string }>;
  result?: {
    id: string;
    company_id: string;
    client_id: string;
    tracking_number: string;
    request_date: string;
    pickup_date: string;
    pickup_date_from: string;
    pickup_date_to: string;
    estimated_value: string;
    observations?: string;
    packages: Array<{
      id: string;
      description: string;
      quantity: number;
      size: string;
      weight_kg: string;
      height_cm: string;
      width_cm: string;
      length_cm: string;
      volumetric_weight?: string | null;
      m3?: string | null;
      created_at?: string;
    }>;
    created_at?: string;
    updated_at?: string;
  };
  pagination?: null;
}
