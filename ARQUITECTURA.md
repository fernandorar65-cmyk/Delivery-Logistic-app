# 🏗️ Arquitectura del Proyecto

## 📋 Índice
1. [Visión General](#visión-general)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Estructura del Proyecto](#estructura-del-proyecto)
4. [Patrones Arquitectónicos](#patrones-arquitectónicos)
5. [Gestión de Estado](#gestión-de-estado)
6. [Routing y Navegación](#routing-y-navegación)
7. [Autenticación y Seguridad](#autenticación-y-seguridad)
8. [Comunicación con API](#comunicación-con-api)
9. [Convenciones de Código](#convenciones-de-código)
10. [Mejores Prácticas](#mejores-prácticas)

---

## 🎯 Visión General

Este proyecto sigue una **arquitectura modular basada en features** utilizando las últimas características de Angular moderno. La arquitectura está diseñada para ser:

- **Escalable**: Fácil de extender con nuevas features
- **Mantenible**: Código organizado y bien estructurado
- **Performante**: Optimizado con lazy loading, signals y zoneless change detection
- **Type-Safe**: TypeScript estricto en todo el proyecto
- **SSR-Ready**: Configurado para Server-Side Rendering

---

## 🛠️ Stack Tecnológico

### Core
- **Angular**: 20.3.0+ (última versión)
- **TypeScript**: 5.9.2 (modo estricto)
- **Node.js**: Compatible con versiones LTS

### Características Angular
- ✅ **Standalone Components**: Sin módulos Angular
- ✅ **Signals**: Gestión de estado reactiva
- ✅ **Zoneless Change Detection**: Optimización de rendimiento
- ✅ **Server-Side Rendering (SSR)**: Configurado con Angular Universal
- ✅ **Lazy Loading**: Carga diferida de componentes

### Build y Deployment
- **Build System**: Angular CLI con `@angular/build`
- **Deployment**: Netlify
- **SSR Runtime**: Angular SSR

---

## 📁 Estructura del Proyecto

```
src/app/
├── components/          # Componentes reutilizables (presentational)
│   ├── hero-icon/       # Componente compartido de iconos
│   ├── clients/         # Componentes específicos de clientes
│   ├── drivers/         # Componentes específicos de conductores
│   ├── orders/          # Componentes específicos de pedidos
│   └── operations/       # Componentes específicos de operaciones
│
├── views/               # Vistas/Contenedores (smart components)
│   ├── login/           # Vista de login
│   ├── dashboard/       # Vista del dashboard
│   ├── allies/          # Vista de aliados
│   ├── companies/       # Vista de compañías
│   ├── clients/         # Vistas de clientes
│   ├── drivers/         # Vistas de conductores
│   ├── orders/          # Vistas de pedidos
│   ├── operations/      # Vistas de operaciones
│   ├── users/           # Vistas de usuarios
│   └── internal-clients/# Vistas de clientes internos
│
├── services/            # Lógica de negocio y comunicación con API
│   ├── auth.service.ts
│   ├── storage.service.ts
│   ├── company.service.ts
│   ├── client.service.ts
│   └── ...
│
├── models/              # Tipos e interfaces TypeScript
│   ├── auth.model.ts
│   ├── company.model.ts
│   ├── client.model.ts
│   └── ...
│
├── guards/              # Route Guards
│   ├── auth.guard.ts    # Protege rutas autenticadas
│   └── guest.guard.ts  # Protege rutas de invitados (login)
│
├── interceptors/        # HTTP Interceptors
│   └── auth.interceptor.ts  # Interceptor de autenticación
│
├── layouts/             # Layouts compartidos
│   └── main-layout/     # Layout principal de la aplicación
│
└── router/              # Configuración de rutas
    ├── app.routes.ts           # Rutas del cliente
    └── app.routes.server.ts    # Rutas del servidor (SSR)
```

---

## 🏛️ Patrones Arquitectónicos

### 1. Container/Presentational Pattern (Smart/Dumb Components)

El proyecto implementa claramente la separación entre componentes inteligentes y presentacionales:

#### **Views (Smart Components)**
- Ubicación: `src/app/views/`
- Responsabilidades:
  - Manejan estado y lógica de negocio
  - Interactúan con servicios
  - Gestionan formularios complejos
  - Controlan la navegación
  - Usan Signals para estado reactivo

**Ejemplo:**
```typescript
@Component({
  selector: 'app-company-list-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HeroIconComponent],
  templateUrl: './company-list-view.component.html',
  styleUrl: './company-list-view.component.css'
})
export class CompanyListViewComponent {
  private companyService = inject(CompanyService);
  
  companies = signal<Company[]>([]);
  loading = signal(false);
  
  loadCompanies() {
    this.companyService.getAll().subscribe({
      next: (response) => {
        this.companies.set(response.result || []);
      }
    });
  }
}
```

#### **Components (Presentational Components)**
- Ubicación: `src/app/components/`
- Responsabilidades:
  - Reciben datos mediante `@Input()`
  - Emiten eventos mediante `@Output()`
  - Son reutilizables y testeables
  - No tienen dependencias directas de servicios
  - Se enfocan solo en la presentación

### 2. Service Layer Pattern

Los servicios encapsulan toda la lógica de comunicación con APIs y lógica de negocio:

```typescript
@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/companies`;

  getAll(): Observable<CompanyListResponse> {
    return this.http.get<CompanyListResponse>(`${this.apiUrl}/`);
  }

  create(company: CompanyCreate): Observable<Company> {
    return this.http.post<Company>(`${this.apiUrl}/`, company);
  }
}
```

### 3. Model-Driven Development

Todos los datos están tipados con interfaces TypeScript:

```typescript
export interface Company {
  id?: string;
  company_name: string;
  ruc: string;
  description?: string;
  user_email?: string;
  user_type?: string;
}

export interface CompanyListResponse {
  errors: any[];
  result: Company[];
  pagination: {
    count: number;
    next: string | null;
    previous: string | null;
  };
}
```

---

## 📊 Gestión de Estado

### Signals (Angular Signals)

El proyecto utiliza **Angular Signals** para la gestión de estado reactiva:

**Ventajas:**
- ✅ Cambio de detección más eficiente
- ✅ Reactividad automática
- ✅ Mejor rendimiento que Observables para estado local
- ✅ Compatible con Zoneless Change Detection

**Ejemplo de uso:**
```typescript
export class CompanyListViewComponent {
  // Estado reactivo con Signals
  companies = signal<Company[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  searchQuery = signal('');
  
  // Computed signals
  filteredCompanies = computed(() => {
    const query = this.searchQuery().toLowerCase();
    return this.companies().filter(c => 
      c.company_name.toLowerCase().includes(query)
    );
  });
}
```

**En el template:**
```html
@if (loading()) {
  <div>Cargando...</div>
} @else {
  @for (company of filteredCompanies(); track company.id) {
    <div>{{ company.company_name }}</div>
  }
}
```

### Zoneless Change Detection

El proyecto está configurado para usar **Zoneless Change Detection**:

```typescript
// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(), // ✅ Zoneless activado
    // ...
  ]
};
```

**Beneficios:**
- Mejor rendimiento
- Menor uso de memoria
- Cambios de detección más precisos

---

## 🧭 Routing y Navegación

### Lazy Loading

Todas las rutas (excepto login y layout) utilizan **lazy loading**:

```typescript
export const routes: Routes = [
  {
    path: 'companies',
    loadComponent: () => import('../app/views/companies/company-list-view/company-list-view.component')
      .then(m => m.CompanyListViewComponent)
  }
];
```

**Ventajas:**
- ✅ Carga inicial más rápida
- ✅ Mejor code splitting
- ✅ Mejor rendimiento

### Route Guards

#### Auth Guard
Protege rutas que requieren autenticación:

```typescript
export const authGuard: CanActivateFn = (route, state) => {
  const accessToken = storageService.getItem('access_token');
  
  if (!accessToken || isTokenExpired(accessToken)) {
    router.navigate(['/login']);
    return false;
  }
  
  return true;
};
```

#### Guest Guard
Protege rutas de invitados (previene que usuarios autenticados accedan al login):

```typescript
export const guestGuard: CanActivateFn = () => {
  const accessToken = storageService.getItem('access_token');
  
  if (accessToken && !isTokenExpired(accessToken)) {
    router.navigate(['/dashboard']);
    return false;
  }
  
  return true;
};
```

### Estructura de Rutas

```
/ (redirect) → /login
/login → LoginViewComponent (guestGuard)
/dashboard → DashboardViewComponent (authGuard)
/companies → CompanyListViewComponent (authGuard, lazy)
/clients → ClientListViewComponent (authGuard, lazy)
...
```

---

## 🔐 Autenticación y Seguridad

### Flujo de Autenticación

1. **Login**: Usuario ingresa credenciales
2. **Token Storage**: Se guardan `access_token` y `refresh_token` en localStorage
3. **Interceptor**: Agrega token a todas las peticiones HTTP
4. **Token Refresh**: Refresca automáticamente antes de expirar
5. **Logout**: Limpia tokens y redirige al login

### Auth Interceptor

El interceptor maneja:
- ✅ Agregar token a headers
- ✅ Refrescar token preventivamente (5 min antes de expirar)
- ✅ Refrescar token reactivamente (en caso de 401)
- ✅ Redirigir al login si no hay token válido

```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const storageService = inject(StorageService);
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const accessToken = storageService.getItem('access_token');
  
  // Refrescar token preventivamente
  if (accessToken && isTokenExpiringSoon(accessToken)) {
    return authService.refreshToken().pipe(
      switchMap(() => next(addTokenToRequest(req, storageService)))
    );
  }
  
  // Agregar token a la petición
  const authReq = addTokenToRequest(req, storageService);
  
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Refrescar token reactivamente en caso de 401
      if (error.status === 401) {
        return authService.refreshToken().pipe(
          switchMap(() => next(addTokenToRequest(req, storageService)))
        );
      }
      return throwError(() => error);
    })
  );
};
```

### Storage Service (SSR-Safe)

El `StorageService` maneja localStorage de forma segura para SSR:

```typescript
@Injectable({ providedIn: 'root' })
export class StorageService {
  private platformId = inject(PLATFORM_ID);

  getItem(key: string): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(key);
    }
    return null;
  }
}
```

---

## 🌐 Comunicación con API

### Estructura de Respuestas

Todas las respuestas de la API siguen un formato estándar:

```typescript
interface ApiResponse<T> {
  errors: any[];
  result: T;
  pagination?: {
    count: number;
    next: string | null;
    previous: string | null;
  };
}
```

### Manejo de Errores

Los servicios manejan errores de forma consistente:

```typescript
this.companyService.create(companyPayload).subscribe({
  next: () => {
    // Éxito
    this.closeModal();
    this.loadCompanies();
  },
  error: (err) => {
    // Manejo de errores específicos
    if (err.status === 400) {
      this.formError.set('Datos inválidos');
    } else if (err.status === 401) {
      this.formError.set('No autorizado');
    } else if (err.status === 409) {
      this.formError.set('El email o RUC ya está registrado');
    }
  }
});
```

---

## 📝 Convenciones de Código

### Nomenclatura de Archivos

- **Componentes**: `kebab-case.component.ts` (ej: `company-list-view.component.ts`)
- **Servicios**: `kebab-case.service.ts` (ej: `company.service.ts`)
- **Models**: `kebab-case.model.ts` (ej: `company.model.ts`)
- **Guards**: `kebab-case.guard.ts` (ej: `auth.guard.ts`)
- **Interceptors**: `kebab-case.interceptor.ts` (ej: `auth.interceptor.ts`)

### Nomenclatura de Clases

- **Componentes**: `PascalCase` + `Component` (ej: `CompanyListViewComponent`)
- **Servicios**: `PascalCase` + `Service` (ej: `CompanyService`)
- **Models**: `PascalCase` (ej: `Company`, `CompanyListResponse`)

### Estructura de Componentes

```typescript
@Component({
  selector: 'app-component-name',
  standalone: true,
  imports: [/* imports */],
  templateUrl: './component-name.component.html',
  styleUrl: './component-name.component.css'
})
export class ComponentNameComponent {
  // 1. Inyección de dependencias
  private service = inject(Service);
  
  // 2. Signals de estado
  data = signal<Type[]>([]);
  loading = signal(false);
  
  // 3. FormGroups (si aplica)
  form: FormGroup = this.fb.group({});
  
  // 4. Constructor (si es necesario)
  constructor() {
    this.loadData();
  }
  
  // 5. Métodos públicos
  // 6. Métodos privados
}
```

### Imports

Orden recomendado de imports:

```typescript
// 1. Angular core
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

// 2. Angular features
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// 3. RxJS
import { Observable } from 'rxjs';

// 4. Servicios propios
import { CompanyService } from '../../../services/company.service';

// 5. Models
import { Company } from '../../../models/company.model';

// 6. Componentes propios
import { HeroIconComponent } from '../../../components/hero-icon/hero-icon';
```

---

## ✅ Mejores Prácticas

### 1. Standalone Components

✅ **SIEMPRE** usar componentes standalone:
```typescript
@Component({
  standalone: true,
  imports: [CommonModule, ...]
})
```

### 2. Dependency Injection

✅ Usar `inject()` en lugar de constructor injection:
```typescript
private companyService = inject(CompanyService);
```

### 3. Signals para Estado Local

✅ Usar Signals para estado del componente:
```typescript
companies = signal<Company[]>([]);
loading = signal(false);
```

### 4. Type Safety

✅ **NUNCA** usar `any`, siempre tipar:
```typescript
// ❌ Mal
data: any;

// ✅ Bien
data: Company[];
```

### 5. Defensive Programming

✅ Siempre validar datos de API:
```typescript
const companiesArray = Array.isArray(response?.result) 
  ? response.result 
  : [];
this.companies.set(companiesArray);
```

### 6. Error Handling

✅ Manejar errores de forma específica:
```typescript
error: (err) => {
  if (err.status === 400) {
    // Manejo específico
  } else if (err.status === 401) {
    // Manejo específico
  }
}
```

### 7. Responsive CSS

✅ Usar unidades adaptativas en lugar de píxeles fijos:
```css
/* ❌ Mal */
padding: 16px;
font-size: 14px;

/* ✅ Bien */
padding: clamp(1rem, 2.5vw, 1.5rem);
font-size: clamp(0.875rem, 2vw, 0.9375rem);
```

### 8. Template Syntax

✅ Usar control flow moderno de Angular:
```html
<!-- ✅ Bien -->
@if (loading()) {
  <div>Cargando...</div>
}

@for (item of items(); track item.id) {
  <div>{{ item.name }}</div>
}
```

---

## 🚀 Flujo de Desarrollo

### Crear una Nueva Feature

1. **Crear Model** (`models/feature.model.ts`)
   ```typescript
   export interface Feature {
     id?: string;
     name: string;
   }
   ```

2. **Crear Service** (`services/feature.service.ts`)
   ```typescript
   @Injectable({ providedIn: 'root' })
   export class FeatureService {
     private http = inject(HttpClient);
     
     getAll(): Observable<Feature[]> {
       return this.http.get<Feature[]>(`${this.apiUrl}/`);
     }
   }
   ```

3. **Crear View** (`views/feature/feature-list-view/`)
   - `feature-list-view.component.ts`
   - `feature-list-view.component.html`
   - `feature-list-view.component.css`

4. **Agregar Ruta** (`router/app.routes.ts`)
   ```typescript
   {
     path: 'features',
     loadComponent: () => import('../app/views/feature/feature-list-view/...')
       .then(m => m.FeatureListViewComponent)
   }
   ```

5. **Agregar Ruta SSR** (`router/app.routes.server.ts`)
   ```typescript
   { path: 'features', renderMode: RenderMode.Prerender }
   ```

---

## 📚 Recursos Adicionales

- [Angular Documentation](https://angular.dev)
- [Angular Signals](https://angular.dev/guide/signals)
- [Standalone Components](https://angular.dev/guide/components/importing)
- [Zoneless Change Detection](https://angular.dev/guide/change-detection/zoneless)

---

**Última actualización**: Enero 2026
**Versión del documento**: 1.0
