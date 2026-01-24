# Propuesta de Segregacion de Componentes

Objetivo: dividir vistas grandes en componentes pequenos y reutilizables para facilitar mantenimiento, pruebas y escalabilidad.

## Criterios usados
- Vistas con multiples secciones (tarjetas + filtros + tablas + modales).
- Secciones reutilizables en otras vistas (toolbar, tabla, paginacion, empty states).
- Componentes con logica de estado local o rendering condicional.

## Propuesta por vista

### Admin

#### `src/app/views/admin/providers-list-view/*`
Separar en:
- `providers-stats-cards`: tarjetas de estadisticas.
- `providers-toolbar`: buscador, filtros y acciones.
- `providers-table`: tabla, estados loading/error/empty, acciones por fila.
- `providers-pagination`: pie de paginacion y contador.

#### `src/app/views/admin/client-list-view/*`
Separar en:
- `clients-toolbar`: buscador + filtros.
- `clients-table`: tabla y estados (loading/error/empty).
- `client-form-modal`: modal de crear/editar cliente.
- `clients-pagination`: paginacion.

#### `src/app/views/admin/client-detail-view/*` --> aca me quede
Separar en:
- `client-info-card`: bloque de datos principales.
- `client-actions`: botones de acciones (editar, eliminar).

#### `src/app/views/admin/company-list-view/*`
Separar en:
- `companies-filters`: filtros (sector, ciudad, estado).
- `companies-table`: tabla y estados.
- `company-form-modal`: modal crear/editar.
- `companies-pagination`: paginacion.

### Providers

#### `src/app/views/providers/dashboard/*`
Separar en:
- `dashboard-metrics`: tarjetas de metricas.
- `dashboard-tabs`: tabs de estado.
- `dashboard-shipments-table`: tabla principal.
- `dashboard-shipment-row`: fila/elemento de envio (si se agrega mas logica por fila).

#### `src/app/views/providers/vehicles/vehicle-list-view/*`
Separar en:
- `vehicles-stats`: tarjetas de resumen.
- `vehicles-filters`: buscador y filtros por tipo/estado.
- `vehicles-table`: tabla de vehiculos.
- `vehicles-pagination`: paginacion.

#### `src/app/views/providers/vehicles/vehicle-detail-view/*`
Separar en:
- `vehicle-info`: datos principales.
- `vehicle-metrics`: indicadores (capacidad, estado, etc.).
- `vehicle-actions`: acciones (editar, eliminar).

### Auth

#### `src/app/views/auth/login/*`
No requiere separacion por ahora. Se sugiere dividir solo si:
- se agrega login social,
- se agrega recuperacion de clave avanzada,
- se implementa un flujo multi-step.

## Componentes compartidos sugeridos
- `app-table-empty`: empty states reutilizables (icono + titulo + subtitulo + CTA).
- `app-loading-block`: spinner + texto para estados de carga.
- `app-stats-card`: tarjeta de estadistica parametrizable.
- `app-toolbar-search`: input de busqueda con icono.
- `app-pagination`: paginacion generica.

## Prioridad recomendada
1. `providers-list-view`
2. `company-list-view`
3. `client-list-view`
4. `vehicle-list-view`
5. `dashboard`

Si quieres, puedo iniciar la separacion por la vista que indiques.
