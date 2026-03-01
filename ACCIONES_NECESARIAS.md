# Acciones necesarias — Patrick Proyecto (LOGISAAS)

> Resumen de tareas pendientes y completadas. Origen: `MEJORAS.md`, `ANALISIS_ARQUITECTURA.md` y análisis del proyecto.

---

## Resumen de progreso

| Área              | Pendientes | Hechas |
|-------------------|------------|--------|
| Configuración     | 3          | 0      |
| Código / refactor | 4          | 3      |
| Calidad (tests/lint) | 3       | 0      |
| UI / UX          | 2          | 0      |
| Documentación    | 1          | 0      |
| **Total**         | **13**     | **3**  |

---

## 1. Configuración y entornos

### Alta prioridad

- [ ] **Configurar `fileReplacements` para producción**
  - En `angular.json`, en la configuración de producción, añadir:
    ```json
    "fileReplacements": [
      { "replace": "src/environments/environment.ts", "with": "src/environments/environment.prod.ts" }
    ]
    ```
  - Asegurar que existan `environment.ts` y `environment.prod.ts` si se usan.

- [ ] **Corregir URL de API en producción**
  - En `environment.prod.ts`, configurar la URL real de la API de producción (no reutilizar la de desarrollo).

### Media prioridad

- [ ] **Revisar estrategia SSR en rutas privadas**
  - Documentar o ajustar el manejo de rutas protegidas con SSR para evitar errores (según análisis de arquitectura).

---

## 2. Código y refactor

### Alta prioridad

- [x] ~~Extraer `formatApiErrors` a shared~~ (hecho en `shared/utils/api-response.ts`)
- [x] ~~Reemplazar `confirm()` por modal de confirmación~~ (client-list-view, internal-users-view, company-list-view, client-detail-view)

### Media prioridad

- [ ] **Eliminar o archivar componentes huérfanos**
  - `client-shipments-upload-view` y `client-shipments-upload-v2-view` no están en rutas activas.
  - Acción: eliminar o mover a `_archive/` o `examples/`.

- [x] ~~Lazy load de `ClientDetailViewComponent`~~ (hecho en rutas)

- [ ] **Extraer lógica duplicada en facades**
  - `formatDate` y `mapStatus` repetidos en `ClientCompaniesFacade` y `ProviderCompaniesFacade`.
  - Crear util en `shared/utils/` (ej. `date.utils.ts`, `status.utils.ts`) y usarlo en ambos facades.

### Refactors sugeridos (ANALISIS_ARQUITECTURA)

- [ ] **Separar vistas grandes en subcomponentes**
  - Prioridad: `providers-list-view`, luego `company-list-view` y `client-list-view`.
  - Extraer modales grandes a componentes dedicados.

- [ ] **Normalizar DTOs / respuestas de API**
  - Crear `*Response`, `*Payload` o carpeta `dto/` por entidad.
  - Mapear en servicios campos inconsistentes (ej. `user_email` vs `email`).
  - Evitar que las vistas dependan de la estructura cruda del API.

- [ ] **Mover lógica de negocio a servicios o facades**
  - Flujos tipo create + match en services/facades, no en componentes.
  - Evitar llamadas HTTP directas desde modales.

- [ ] **Limpiar `console.log` en servicios**
  - Auditar y eliminar o reemplazar por un logger controlado.

- [ ] **Unificar claves de localStorage**
  - Usar un enum o constante central para todas las claves (ej. en `core/storage` o `shared`).

---

## 3. Calidad: tests y lint

### Tests

- [ ] **Tests unitarios**
  - Servicios críticos (AuthService, StorageService, servicios de features).
  - Guards: `authGuard`, `guestGuard`, `roleGuard`.

- [ ] **Tests de componentes críticos**
  - Login, flujos de create/delete en al menos una feature (ej. clientes o companies).

- [ ] **Tests e2e**
  - Configurar Cypress o Playwright (no hay e2e en el repo).
  - Cubrir al menos: login, navegación por rol, un flujo crítico (ej. listado + detalle).

### Lint y pipeline

- [ ] **Añadir ESLint**
  - Configurar `@angular-eslint` (o equivalente) con reglas recomendadas para Angular.
  - Incluir en script de build o pre-commit.

- [ ] **Pipeline de calidad**
  - `lint` + `test` + `build` en CI (por ejemplo en GitHub Actions o similar).

---

## 4. UI / UX

### Baja prioridad

- [ ] **Barra de búsqueda del header**
  - Implementar la funcionalidad o quitarla si no se va a usar.

- [ ] **Botón "Ayuda"**
  - Implementar o remover del layout.

### Mejoras de UI compartida (ANALISIS_ARQUITECTURA)

- [x] **Componentes shared reutilizables** (implementado Mar 2025)
  - Estados vacíos y loading ya existen en `shared/ui`; revisar cobertura.
  - **Añadido:** `app-list-toolbar` — toolbar genérico con búsqueda opcional, acción principal y proyección para filtros/acciones.
  - **Añadido:** `app-stats-card` — grid de tarjetas de estadísticas; modelo `StatCardItem` en `shared/models/stat-card-item.model.ts`.
  - Paginación ya existía en `shared/ui/pagination`.
  - Uso documentado en `src/app/shared/ui/README.md`.

---

## 5. Documentación

- [ ] **Documentar patrón de InternalUsersViewComponent**
  - Cómo se reutiliza con distintos `ownerType` / `ownerId` según la ruta (admin/company/provider/client).
  - Añadir comentarios en código o un pequeño doc en `docs/` o en el README.

---

## Orden sugerido de ejecución

1. **Inmediato (configuración):** fileReplacements + URL prod + revisar SSR si hubo errores.
2. **Corto plazo:** archivar/eliminar componentes huérfanos, extraer `formatDate`/`mapStatus` a shared.
3. **Medio plazo:** ESLint, tests unitarios en guards y 1–2 servicios críticos.
4. **Largo plazo:** separar vistas grandes, DTOs normalizados, tests e2e, documentación de InternalUsersView.

---

## Referencias

- `MEJORAS.md` — Checklist original del proyecto.
- `ANALISIS_ARQUITECTURA.md` — Diagnóstico y plan por fases.

*Última actualización: Mar 2025*
