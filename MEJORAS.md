# Checklist de Mejoras - Patrick Proyecto (LOGISAAS)

> *Arquitectura Screaming Architecture validada. Este checklist enfoca calidad de código y configuración.*

---

## Alta prioridad

- [ ] **Configurar `fileReplacements` para producción**
  - En `angular.json`, añadir reemplazo de `environment.prod.ts` en build de producción
  - Verificar que `environment.prod.ts` tenga la URL de API de producción (no dev)

- [x] **Extraer `formatApiErrors` a shared**
  - Añadir función en `shared/utils/api-response.ts`
  - Refactorizar usos en `client-list-view` e `internal-users-view`

- [x] **Reemplazar `confirm()` por modal de confirmación**
  - Usar componente modal reutilizable para eliminaciones
  - Archivos: client-list-view, internal-users-view, company-list-view, client-detail-view

---

## Media prioridad

- [ ] **Eliminar o archivar componentes huérfanos**
  - Decidir sobre `client-shipments-upload-view` y `client-shipments-upload-v2-view`
  - Opción: eliminar o mover a `examples/` o `_archive/`

- [x] **Lazy load de `ClientDetailViewComponent`**
  - Cambiar de import directo a `loadComponent` en rutas
  - Reduce bundle inicial

- [ ] **Corregir URL en `environment.prod.ts`**
  - Asegurar que apunte a API de producción real (actualmente usa misma URL que dev)

- [ ] **Extraer lógica duplicada en facades**
  - `formatDate` y `mapStatus` repetidos en ClientCompaniesFacade y ProviderCompaniesFacade
  - Crear util compartido en `shared/utils/`

---

## Baja prioridad

- [ ] **Implementar o remover barra de búsqueda del header**
  - Actualmente sin funcionalidad

- [ ] **Implementar o remover botón "Ayuda"**
  - Actualmente sin funcionalidad

- [ ] **Añadir tests**
  - Servicios, guards y componentes críticos

- [ ] **Documentar patrón de InternalUsersViewComponent**
  - Cómo se reutiliza con distintos `ownerType`/`ownerId` según ruta

---

## Progreso

| Prioridad | Total | Completados |
|-----------|-------|-------------|
| Alta      | 3     | 2           |
| Media     | 4     | 1           |
| Baja      | 4     | 0           |
| **Total** | **11**| **3**       |

---

*Última actualización: Feb 2025*
