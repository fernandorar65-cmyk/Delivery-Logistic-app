# Screaming Architecture: Propuesta para este proyecto

Este documento describe una estructura por dominio (screaming architecture) para que el
proyecto “grite” sus features (clientes, proveedores, vehículos, etc.) en lugar de su
tecnología. La idea es que la estructura comunique el negocio desde el primer vistazo.

## ¿Es viable para este proyecto?
Sí, es viable y recomendable si se proyecta crecimiento en features, roles y flujos.
Ya existen dominios claros y una base de componentes compartidos. La migración debe
ser incremental para no frenar entregas.

## Principios clave
- El dominio manda: las carpetas principales son features (clientes, proveedores, etc.).
- UI aislada: componentes “tontos” en `components/` y vistas en `pages/`.
- Lógica en capa intermedia: `facades/` o `use-cases/` para orquestar flujos.
- DTOs normalizados: el API siempre se consume con `errors/result`.
- Shared solo para lo transversal (UI, utilidades, tipos comunes).

## Estructura propuesta
src/
  app/
    core/
      auth/
      guards/
      interceptors/
      layout/
      routing/
    features/
      clients/
        pages/
        components/
        services/
        models/
        facades/
      companies/
        pages/
        components/
        services/
        models/
        facades/
      providers/
        pages/
        components/
        services/
        models/
        facades/
      vehicles/
        pages/
        components/
        services/
        models/
        facades/
      dashboard/
        pages/
        components/
        services/
        models/
    shared/
      ui/
      models/
      services/
      utils/
      pipes/
      directives/

## Qué va en cada capa
- `core/`: infraestructura y cross‑cutting (auth, guards, interceptor, layout).
- `features/<feature>/pages/`: contenedores (vistas) con wiring y routing.
- `features/<feature>/components/`: UI reutilizable del feature.
- `features/<feature>/services/`: acceso a API específico del dominio.
- `features/<feature>/models/`: DTOs y tipos del dominio.
- `features/<feature>/facades/`: flujos complejos y orquestación.
- `shared/`: UI y utilidades reutilizables entre features.

## Reglas de importación (disciplina)
- `features/*` solo puede importar de `shared/` y `core/`.
- `shared/` no importa desde `features/`.
- `core/` no depende de `features/` (para evitar ciclos).
- Los componentes de `components/` no llaman API directo: usan `facades/` o inputs.

## Migración incremental (sin romper todo)
1. Crear `features/` y mover un dominio completo (ej. `vehicles`).
2. Ajustar imports y rutas solo para ese feature.
3. Mover DTOs a `features/<feature>/models/`.
4. Introducir `facade` para los flujos más complejos.
5. Repetir con el siguiente dominio.

## Mapeo sugerido desde lo actual
- `views/admin/client-*` → `features/clients/pages/` + `components/`
- `views/admin/company-*` → `features/companies/pages/` + `components/`
- `views/providers/vehicles/*` → `features/vehicles/pages/` + `components/`
- `services/*.service.ts` → mover por dominio a `features/<feature>/services/`
- `models/*.model.ts` → mover por dominio a `features/<feature>/models/`
- `shared/ui/*` se mantiene en `shared/ui/`

## Señales de éxito
- Nuevos devs encuentran un feature sin buscar en “components”.
- Los endpoints se consumen con tipos consistentes.
- Menos imports relativos complejos y menos rutas rotas.
- Los componentes de UI se testean sin mocks de API.

## Siguiente paso recomendado
Migrar primero `vehicles` (ya está segmentado), luego `clients` y `companies`.
Si quieres, definimos el plan de migración por carpeta y lo ejecuto paso a paso.
