import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Rutas estáticas - prerender
  {
    path: '',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'login',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'dashboard',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'clients',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'clients/new',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'drivers',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'drivers/new',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'internal-clients',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'internal-clients/new',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'users',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'users/new',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'operations',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'operations/new',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'orders',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'orders/new',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'allies',
    renderMode: RenderMode.Prerender
  },
  // Rutas dinámicas con parámetros - server-side rendering
  {
    path: 'clients/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'clients/:id/edit',
    renderMode: RenderMode.Server
  },
  {
    path: 'drivers/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'drivers/:id/edit',
    renderMode: RenderMode.Server
  },
  {
    path: 'internal-clients/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'internal-clients/:id/edit',
    renderMode: RenderMode.Server
  },
  {
    path: 'users/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'users/:id/edit',
    renderMode: RenderMode.Server
  },
  {
    path: 'operations/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'operations/:id/edit',
    renderMode: RenderMode.Server
  },
  {
    path: 'orders/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'orders/:id/edit',
    renderMode: RenderMode.Server
  }
];
