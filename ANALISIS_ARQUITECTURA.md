# Analisis de Arquitectura y Escalabilidad

Objetivo: identificar debilidades estructurales y proponer pasos claros para mejorar mantenibilidad y escalabilidad.

## Diagnostico resumido
- Base funcional para MVP, pero fragil para crecer.
- Vistas grandes mezclan UI + logica + estado + flujos.
- Modelos/DTOs inconsistentes con respuestas reales del API.
- Reutilizacion de UI baja (mucho duplicado).
- Falta una capa intermedia (facades/use-cases) para separar negocio de UI.

## Fortalezas actuales
- Separacion por dominios en `views/` (admin, providers, auth).
- Servicios centralizados en `services/`.
- Guards e interceptor bien ubicados.
- Models existen (aunque necesitan normalizacion).

## Principales riesgos de escalabilidad
1. Vistas monoliticas (crecen demasiado rapido).
2. Duplicacion de componentes UI (toolbars, tablas, empty states).
3. Cambios en API rompen UI por falta de DTOs normalizados.
4. Flujos de negocio viven en componentes (acoplamiento alto).
5. SSR + rutas privadas sin estrategia clara (ya genero errores).

## Propuesta de mejoras (por fases)

### Fase 1: Quick wins
- Separar vistas grandes en subcomponentes (ver `ANALISIS_COMPONENTES.md`).
- Crear UI shared basica: `app-table-empty`, `app-pagination`, `app-stats-card`.
- Limpiar `console.log` en servicios.
- Unificar claves de localStorage con enum central.

### Fase 2: Estandar de DTOs
- Crear `dto/` o prefijos `*Response`, `*Payload`, `*DTO`.
- Normalizar responses en servicios (mapear campos inconsistentes).
- Evitar que vistas dependan de campos crudos del API.

### Fase 3: Capa de dominio
- Crear `features/` por dominio (clients, providers, companies, vehicles).
- Mover vistas + componentes + servicios relacionados dentro de cada feature.
- Agregar `facade` o `use-case` para flujos complejos.

### Fase 4: Testing y control de calidad
- Tests unitarios basicos en servicios y guards.
- Tests de integracion para flujos criticos (login, create, delete).
- Pipeline con lint + test + build.

## Estructura propuesta (si el proyecto crece)
src/
  app/
    features/
      clients/
        components/
        pages/
        services/
        models/
      providers/
        components/
        pages/
        services/
        models/
    shared/
      ui/
      models/
      services/

## Prioridades sugeridas
1. Separar `providers-list-view` (alto impacto).
2. Separar `company-list-view` y `client-list-view`.
3. Normalizar DTOs en `client` y `provider`.
4. Definir estructura `features/` si el equipo crece.

Si quieres, definimos un plan de migracion vista por vista y lo ejecutamos.
