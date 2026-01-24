export type ShipmentStatus = 'in-route' | 'pending' | 'delivered' | 'incident';

export interface ShipmentClient {
  name: string;
  avatar: string;
  type?: string | null;
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
}






