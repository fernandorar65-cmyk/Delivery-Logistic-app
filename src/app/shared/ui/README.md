# Componentes UI compartidos

Componentes reutilizables en `src/app/shared/ui/` para listados y vistas comunes.

---

## ListToolbar (`app-list-toolbar`)

Toolbar genérico para vistas de listado (clientes, proveedores, empresas, etc.).

**Uso:**

```html
<app-list-toolbar
  searchPlaceholder="Buscar por nombre o RUC..."
  [searchQuery]="searchQuery()"
  (searchQueryChange)="onSearch($event)"
  primaryActionLabel="Nuevo cliente"
  primaryActionIcon="plus"
  (primaryAction)="openCreate()"
>
  <!-- Filtros o acciones extra proyectados aquí -->
  <button class="filter-btn" (click)="togglePending()">Pendientes</button>
</app-list-toolbar>
```

**Inputs:**

| Input | Tipo | Descripción |
|-------|------|-------------|
| `searchPlaceholder` | string | Placeholder del buscador. Si está vacío, no se muestra búsqueda. |
| `searchQuery` | string | Valor actual del buscador. |
| `primaryActionLabel` | string | Texto del botón principal. Si está vacío, no se muestra. |
| `primaryActionIcon` | string | Nombre del icono Heroicon (ej. `plus`). Por defecto `plus`. |

**Outputs:**

| Output | Descripción |
|--------|-------------|
| `searchQueryChange` | Emite el nuevo valor al escribir en el buscador. |
| `primaryAction` | Emite al hacer clic en el botón principal. |

**Proyección:** El contenido dentro de `<app-list-toolbar>` se muestra en la zona de acciones (filtros, chips, exportar, etc.).

---

## StatsCard (`app-stats-card`)

Grid de tarjetas de estadísticas para listados. Usa el modelo `StatCardItem` de `@app/shared/models/stat-card-item.model`.

**Uso:**

```ts
import { StatCardItem } from '@app/shared/models/stat-card-item.model';
import { StatsCardComponent } from '@app/shared/ui/stats-card/stats-card.component';

// En el componente:
stats: StatCardItem[] = [
  { label: 'Total', value: 42, icon: 'users', iconColor: 'blue' },
  { label: 'Activos', value: 38, icon: 'check-circle', iconColor: 'emerald', subtitle: 'vs. mes anterior', trend: 'up' },
];
```

```html
<app-stats-card [stats]="stats"></app-stats-card>
```

**StatCardItem:**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `label` | string | Etiqueta de la tarjeta. |
| `value` | string \| number | Valor principal. |
| `icon` | string (opcional) | Nombre del icono Heroicon. |
| `iconColor` | 'blue' \| 'emerald' \| 'purple' \| 'orange' \| 'gray' | Color del icono. |
| `subtitle` | string (opcional) | Texto secundario bajo el valor. |
| `trend` | 'up' \| 'down' (opcional) | Muestra flecha de tendencia. |
| `trendValue` | string (opcional) | Texto de tendencia (si no se usa `subtitle`). |

---

## EmptyState (`app-empty-state`)

Ver `empty-state.component.ts`. Estados vacíos con título, descripción, icono y botón opcional.

## LoadingCard (`app-loading-card`)

Ver `loading-card.component.ts`. Spinner y mensaje de carga.

## Pagination (`app-pagination`)

Ver `pagination.component.ts`. Paginación con total, anterior/siguiente y números de página.

## Tabla base

Estilos en `shared/ui/table/table-base.css`. Incluir en componentes que muestren tablas para mantener apariencia consistente.
