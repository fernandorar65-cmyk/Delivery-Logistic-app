import { Provider } from '@app/features/providers/models/provider.model';

export interface StatCard {
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: string;
  icon: string;
  iconColor: string;
}

// Tipo extendido para mantener campos de diseño que no vienen del API
export interface Ally extends Provider {
  name: string;
  status: 'active' | 'inactive' | 'pending';
  trucks: number;
  motorcycles: number;
  drivers: number;
  driverAvatars?: string[];
  zone: string;
  rating: number | null;
}






