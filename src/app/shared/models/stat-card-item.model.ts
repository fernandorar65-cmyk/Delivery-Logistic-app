/**
 * Modelo para una tarjeta de estadística en listados (clientes, proveedores, vehículos, etc.).
 * Usado por app-stats-card en shared/ui.
 */
export interface StatCardItem {
  label: string;
  value: string | number;
  icon?: string;
  iconColor?: 'blue' | 'emerald' | 'purple' | 'orange' | 'gray';
  subtitle?: string;
  trend?: 'up' | 'down';
  trendValue?: string;
}
