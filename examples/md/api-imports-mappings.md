# API Imports – Guardar plantilla (mappings)

## POST /api/v1/imports/mappings/

Endpoint que guarda la plantilla de Excel del cliente.

### Contrato de persistencia

Al **guardar** en base de datos, el backend debe normalizar y persistir:

1. **Campo `headers`** (cabeceras del Excel)  
   - Cada elemento: **trim** y **toLowerCase**.  
   - Ejemplo: `"  N° de Guía  "` → guardar como `"n° de guía"`.

2. **Campo `mapping`** (diccionario sistema → columna Excel)  
   - Las **claves** no se modifican (ej. `order.tracking_number`, `pickup.address`).  
   - Solo los **valores** (nombres de columna del Excel): **trim** y **toLowerCase**.  
   - Ejemplo: `{ "order.tracking_number": "  N° de Guía  " }` → guardar como `{ "order.tracking_number": "n° de guía" }`.

### Ejemplo de normalización en el backend (pseudocódigo)

```text
Antes de guardar en BD:

headers_saved = [ h.strip().lower() for h in payload['headers'] ]

mapping_saved = {}
for api_key, excel_column in payload['mapping'].items():
    mapping_saved[api_key] = (excel_column or '').strip().lower()
```

Así se garantiza que las plantillas se almacenan siempre con cabeceras y valores del mapping en lowercase y sin espacios, aunque el cliente envíe otro formato.
