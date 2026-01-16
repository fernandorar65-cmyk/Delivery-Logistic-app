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
    path: 'allies',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'companies',
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
    path: 'allies/:allyId/vehicles',
    renderMode: RenderMode.Server
  },
  {
    path: 'allies/:allyId/vehicles/:vehicleId',
    renderMode: RenderMode.Server
  }
];
