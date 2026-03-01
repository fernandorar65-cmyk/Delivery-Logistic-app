# Migración a PrimeNG

Estado de la migración del diseño HTML/CSS a PrimeNG (Angular).

---

## Completado

### 1. Instalación y configuración
- **PrimeNG** `^20.4.0` y **@primeuix/themes** `^2.0.3`, **primeicons** `^7.0.0`.
- **@angular/animations** instalado (requerido por PrimeNG para overlays/dialogs).
- **app.config.ts**: `provideAnimationsAsync()`, `providePrimeNG({ theme: { preset: Aura } })` con tema Aura.
- **angular.json**: `node_modules/primeicons/primeicons.css` en `styles`.
- **styles.css**: eliminado `@import "tailwindcss"` (Tailwind se eliminó al instalar PrimeNG; si lo necesitas, reinstálalo con `npm i -D tailwindcss` y vuelve a añadir el import).

### 2. Build
- `ng build --configuration=development` compila correctamente.

### 3. Layout principal (MainLayout)
- **Sidebar**: sustituido por **p-menu** con `[model]="menuItems()"`; `menuItems` es un `computed` en el componente que construye `MenuItem[]` con `label`, `icon` (PrimeIcons), `routerLink` según `canAccess()` y `userId()`.
- **Header**: sustituido por **p-toolbar** con inicio (logo + título), centro (**p-iconField** + **p-inputText** para búsqueda) y fin (MatchRequestsPanel, **p-button** Ayuda, **p-button** Cerrar sesión, **p-avatar** + datos de usuario).
- Estilos del menú en sidebar (tema oscuro) y del toolbar en `.main-layout.component.css`.

---

## Pendiente (por fases)

### Fase 3: Componentes shared
- **Modal** → **p-dialog**
- **ConfirmModal** → **p-confirmDialog** o **p-confirmPopup**
- **Botones** → **p-button**
- **Inputs** → **p-inputText**, **p-password**
- **Tablas** → **p-table**
- **Empty state / Loading** → **p-inlineMessage**, **p-progressSpinner**
- **Pagination** → **p-paginator**

### Fase 4: Vistas
- **Login**: p-inputText, p-password, p-button, p-message.
- **Dashboard**: p-card, p-panel, p-progressBar / p-chart si aplica.
- **Usuarios internos**: p-table, p-dialog, p-button, p-inputText, p-password.
- **Listados** (clientes, empresas, proveedores, vehículos): p-table, p-toolbar, p-paginator, p-dialog.

### Fase 5: Ajustes
- Revisar **design-tokens.css** y variables `--p-*` para alinear con el tema Aura o personalizar.
- Reinstalar **Tailwind** si se usan clases `*` en componentes que aún no se han migrado.
- Tests y accesibilidad (ARIA en componentes PrimeNG).

---

## Cómo seguir

1. **Layout**: En `main-layout.component.ts` crear un `menuItems` (signal o getter) que devuelva `MenuItem[]` con `label`, `icon` (ej. `pi pi-th-large`), `routerLink`, `visible: canAccess(roles)` para cada ítem. En el template usar `<p-menu [model]="menuItems()" styleClass="layout-sidebar">` y envolver en un `<aside>`. Para el header usar `<p-toolbar>` con start/center/end y dentro `<p-button>`, `<p-iconField>`, `<p-avatar>`.
2. **Rutas con parámetros**: Para ítems como “Usuarios internos” (cliente/empresa/proveedor) que llevan `userId()` en la ruta, el `routerLink` en el modelo debe ser un array, ej. `routerLink: ['/clients', userId(), 'usuarios-internos']`. Tener en cuenta que `userId()` puede no estar aún; en ese caso no mostrar el ítem o usar `visible: false` hasta que llegue.
3. **Documentación PrimeNG v20**: https://v20.primeng.org/ (instalación, temas, componentes).

---

*Última actualización: Mar 2025*
