/** Dirección de recogida o entrega dentro de una orden. */
export interface OrderAddress {
  address?: string;
  reference?: string;
  contact_name?: string;
  contact_phone?: string;
  country?: string;
  department?: string;
  province?: string;
  district?: string;
}

/** Orden dentro de una solicitud de asignación. */
export interface OrderAssignmentOrder {
  id?: string;
  tracking_number?: string;
  client_name?: string;
  request_date?: string;
  pickup_date?: string;
  pickup_date_from?: string;
  pickup_date_to?: string;
  estimated_value?: string;
  observations?: string;
  pickup?: OrderAddress;
  delivery?: OrderAddress;
  /** Origen formateado (ej. "Calle X, DISTRITO"). */
  origen?: string;
  /** Destino formateado (ej. "Calle Y, DISTRITO"). */
  destino?: string;
  /** Ruta completa "De ... a ...". */
  origen_destino?: string;
  created_at?: string;
  [key: string]: unknown;
}

/** Solicitud de asignación de órdenes (respuesta de order-assignment-requests). */
export interface OrderAssignmentRequest {
  id?: string;
  client_name?: string;
  company_name?: string;
  status?: string;
  status_display?: string;
  order_count?: number;
  orders?: OrderAssignmentOrder[];
  description?: string;
  created_at?: string;
  responded_at?: string | null;
  [key: string]: unknown;
}

export interface OrderAssignmentRequestsResponse {
  result?: OrderAssignmentRequest[];
  errors?: unknown[];
  pagination?: {
    /** Total de registros (para el paginador). */
    total: number;
  };
}
