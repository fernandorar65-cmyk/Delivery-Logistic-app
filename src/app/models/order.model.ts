export interface Order {
  id?: string;
  order_number: string;
  client_id: string;
  description: string;
  delivery_address: string;
  delivery_city: string;
  delivery_region: string;
  delivery_country: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface OrderCreate {
  order_number: string;
  client_id: string;
  description: string;
  delivery_address: string;
  delivery_city: string;
  delivery_region: string;
  delivery_country: string;
  notes?: string;
}

export interface OrderUpdate {
  order_number?: string;
  client_id?: string;
  description?: string;
  delivery_address?: string;
  delivery_city?: string;
  delivery_region?: string;
  delivery_country?: string;
  notes?: string;
}

