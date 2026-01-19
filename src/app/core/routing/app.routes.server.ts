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
    renderMode: RenderMode.Server
  },
  {
    path: 'clients',
    renderMode: RenderMode.Server
  },
  {
    path: 'providers',
    renderMode: RenderMode.Server
  },
  {
    path: 'providers/requests',
    renderMode: RenderMode.Server
  },
  {
    path: 'allies',
    renderMode: RenderMode.Server
  },
  {
    path: 'companies',
    renderMode: RenderMode.Server
  },
  // Rutas dinámicas con parámetros - server-side rendering
  {
    path: 'clients/:id',
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






