/**
 * Opciones de ubicación precargadas para el formulario de orden manual.
 * En el futuro se reemplazarán por datos desde API.
 */

export interface LocationOption {
  value: string;
  label: string;
}

export const LOCATION_COUNTRIES: LocationOption[] = [
  { value: 'Peru', label: 'Perú' },
  { value: 'Ecuador', label: 'Ecuador' },
  { value: 'Colombia', label: 'Colombia' },
  { value: 'Chile', label: 'Chile' },
  { value: 'Bolivia', label: 'Bolivia' }
];

export const LOCATION_DEPARTMENTS: LocationOption[] = [
  { value: 'Lima', label: 'Lima' },
  { value: 'Arequipa', label: 'Arequipa' },
  { value: 'Cusco', label: 'Cusco' },
  { value: 'La Libertad', label: 'La Libertad' },
  { value: 'Piura', label: 'Piura' },
  { value: 'Lambayeque', label: 'Lambayeque' },
  { value: 'Junin', label: 'Junín' },
  { value: 'Puno', label: 'Puno' },
  { value: 'Ica', label: 'Ica' },
  { value: 'Callao', label: 'Callao' }
];

export const LOCATION_PROVINCES: LocationOption[] = [
  { value: 'Lima', label: 'Lima' },
  { value: 'Callao', label: 'Callao' },
  { value: 'Huaral', label: 'Huaral' },
  { value: 'Barranca', label: 'Barranca' },
  { value: 'Canta', label: 'Canta' },
  { value: 'Arequipa', label: 'Arequipa' },
  { value: 'Caylloma', label: 'Caylloma' },
  { value: 'Cusco', label: 'Cusco' },
  { value: 'Trujillo', label: 'Trujillo' },
  { value: 'Chiclayo', label: 'Chiclayo' }
];

export const LOCATION_DISTRICTS: LocationOption[] = [
  { value: 'Miraflores', label: 'Miraflores' },
  { value: 'San Isidro', label: 'San Isidro' },
  { value: 'Lima', label: 'Lima' },
  { value: 'Jesus Maria', label: 'Jesús María' },
  { value: 'Lince', label: 'Lince' },
  { value: 'La Molina', label: 'La Molina' },
  { value: 'Santiago de Surco', label: 'Santiago de Surco' },
  { value: 'Surquillo', label: 'Surquillo' },
  { value: 'San Borja', label: 'San Borja' },
  { value: 'Magdalena', label: 'Magdalena' },
  { value: 'Pueblo Libre', label: 'Pueblo Libre' },
  { value: 'Callao', label: 'Callao' },
  { value: 'Carmen de la Legua', label: 'Carmen de la Legua' },
  { value: 'Arequipa', label: 'Arequipa' },
  { value: 'Cayma', label: 'Cayma' },
  { value: 'Yanahuara', label: 'Yanahuara' },
  { value: 'Cusco', label: 'Cusco' },
  { value: 'Wanchaq', label: 'Wanchaq' },
  { value: 'Santiago', label: 'Santiago' },
  { value: 'Trujillo', label: 'Trujillo' },
  { value: 'Chiclayo', label: 'Chiclayo' }
];
