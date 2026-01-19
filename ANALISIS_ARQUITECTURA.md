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

## Plan paso a paso (sugerido)

### Paso 1: Estabilizar UI y separar vistas
- Terminar segregacion de `dashboard` y `vehicle-list-view` (en curso).
- Extraer modales grandes a componentes dedicados.
- Verificar que no existan rutas/links rotos.

### Paso 2: Normalizar DTOs y respuestas
- Definir modelos de respuesta por entidad (`ClientResponse`, `CompanyResponse`, etc.).
- Mapear campos inconsistentes en servicios (ej: `user_email` vs `email`).
- Centralizar validaciones de payload en servicios.

### Paso 3: Crear UI shared basica
- Componentes compartidos para estados vacios y loading.
- Paginacion y toolbar genericas reutilizables.
- Unificar estilos de botones/inputs comunes.

### Paso 4: Separar logica de negocio
- Mover flujos (create + match, etc.) a services o facades.
- Reducir logica en componentes de UI.
- Evitar llamados API directos desde modales.

### Paso 5: Reorganizar estructura por feature
- Crear carpetas `features/clients`, `features/providers`, etc.
- Mover vistas y componentes relacionados a su feature.
- Mantener `shared/` para UI y utilidades comunes.

### Paso 6: Calidad y seguridad
- Agregar tests de login, create, delete y permisos.
- Revisar SSR para rutas privadas (ya iniciado).
- Auditar errores silenciosos y limpiar logs.

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
