/**
 * Constantes y configuración del flujo de carga de órdenes por Excel (V3).
 * Capa de configuración: sin lógica, solo datos.
 */

export type StandardField = {
  id: string;
  label: string;
  apiKey: string;
};

export type StandardSection = {
  id: string;
  title: string;
  fields: StandardField[];
};

export const MIN_HEADER_COLUMNS = 6;

export const REQUIRED_MAPPING_KEYS = [
  'order.tracking_number',
  'order.request_date'
] as const;

export const REQUIRED_ADDRESS_KEYS = ['pickup.address', 'delivery.address'] as const;

/** API keys que corresponden a campos de fecha (se normalizan a ISO para PostgreSQL). */
export const DATE_API_KEYS = ['order.request_date', 'pickup.date'] as const;

/** API keys que corresponden a campos de hora (se normalizan a HH:MM:SS para PostgreSQL). */
export const TIME_API_KEYS = ['pickup.time_from', 'pickup.time_to'] as const;

export const STANDARD_SECTIONS: StandardSection[] = [
  {
    id: 'pickup',
    title: 'Datos de recojo',
    fields: [
      { id: 'order_client_code', label: 'Código cliente', apiKey: 'order.client_code' },
      { id: 'order_tracking_number', label: 'N° de guía', apiKey: 'order.tracking_number' },
      { id: 'order_request_date', label: 'Fecha de solicitud', apiKey: 'order.request_date' },
      { id: 'pickup_company', label: 'Nombre de empresa (Recojo)', apiKey: 'pickup.company_name' },
      { id: 'pickup_contact', label: 'Nombre de contacto (Recojo)', apiKey: 'pickup.contact_name' },
      { id: 'pickup_phone', label: 'Celular (Recojo)', apiKey: 'pickup.phone' },
      { id: 'pickup_address', label: 'Dirección de recojo', apiKey: 'pickup.address' },
      { id: 'pickup_reference', label: 'Referencia (Recojo)', apiKey: 'pickup.reference' },
      { id: 'pickup_country', label: 'País', apiKey: 'pickup.country' },
      { id: 'pickup_district', label: 'Distrito (Recojo)', apiKey: 'pickup.district' },
      { id: 'pickup_province', label: 'Provincia (Recojo)', apiKey: 'pickup.province' },
      { id: 'pickup_department', label: 'Departamento (Recojo)', apiKey: 'pickup.department' },
      { id: 'pickup_date', label: 'Fecha de recojo', apiKey: 'pickup.date' },
      { id: 'pickup_start_time', label: 'Hora inicio de recojo', apiKey: 'pickup.time_from' },
      { id: 'pickup_end_time', label: 'Hora fin de recojo', apiKey: 'pickup.time_to' }
    ]
  },
  {
    id: 'delivery',
    title: 'Datos de entrega',
    fields: [
      { id: 'delivery_company', label: 'Nombre de empresa (Entrega)', apiKey: 'delivery.company_name' },
      { id: 'delivery_contact', label: 'Nombre de contacto (Entrega)', apiKey: 'delivery.contact_name' },
      { id: 'delivery_document', label: 'DNI (Entrega)', apiKey: 'delivery.dni' },
      { id: 'delivery_phone', label: 'Celular (Entrega)', apiKey: 'delivery.phone' },
      { id: 'delivery_address', label: 'Dirección (Entrega)', apiKey: 'delivery.address' },
      { id: 'delivery_reference', label: 'Referencia (Entrega)', apiKey: 'delivery.reference' },
      { id: 'delivery_district', label: 'Distrito (Entrega)', apiKey: 'delivery.district' },
      { id: 'delivery_province', label: 'Provincia (Entrega)', apiKey: 'delivery.province' },
      { id: 'delivery_department', label: 'Departamento (Entrega)', apiKey: 'delivery.department' }
    ]
  },
  {
    id: 'package',
    title: 'Datos de paquete',
    fields: [
      { id: 'package_description', label: 'Descripción del paquete', apiKey: 'package.description' },
      { id: 'package_qty', label: 'Cantidad de paquetes', apiKey: 'package.quantity' },
      { id: 'package_weight', label: 'Peso guía (KG)', apiKey: 'package.weight' },
      { id: 'package_size', label: 'Tamaño referencial guía', apiKey: 'package.size' },
      { id: 'package_height', label: 'Alto CM', apiKey: 'package.height' },
      { id: 'package_width', label: 'Ancho CM', apiKey: 'package.width' },
      { id: 'package_depth', label: 'Profundidad CM', apiKey: 'package.length' },
      { id: 'package_volumetric', label: 'Peso volumétrico guía', apiKey: 'package.volumetric_weight' },
      { id: 'package_m3', label: 'M3 guía', apiKey: 'package.m3' },
      { id: 'package_value', label: 'Valor estimado (opcional)', apiKey: 'order.estimated_value' },
      { id: 'package_notes', label: 'Observaciones (opcional)', apiKey: 'order.observations' }
    ]
  }
];

export const SECTION_TITLE_SHORT: Record<string, string> = {
  pickup: 'Recojo',
  delivery: 'Entrega',
  package: 'Paquete'
};
