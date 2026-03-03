export type ShipmentStatus = 'in-route' | 'pending' | 'delivered' | 'incident';

export interface ShipmentClient {
  name: string;
  avatar: string;
  type?: string | null;
  email?: string | null;
}

export interface ShipmentVehicle {
  name: string;
  plate?: string | null;
}

export interface Shipment {
  id: string;
  client: ShipmentClient;
  destination: string;
  eta: string;
  vehicle: ShipmentVehicle | null;
  status: ShipmentStatus;
  statusText: string;
  /** Fecha del envío/orden para listado (ej. "5 May 2024") */
  date?: string;
  /** Ingreso asociado si aplica (ej. 59 o null para "Free") */
  revenue?: number | null;
}






