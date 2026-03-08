import { Component, signal, inject, PLATFORM_ID, OnInit, computed } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { AuthService } from '@app/core/auth/services/auth.service';
import { MatchRequestsPanelComponent } from '@app/core/layout/components/match-requests-panel/match-requests-panel.component';
import { SidebarNavComponent } from '@app/core/layout/components/sidebar-nav/sidebar-nav.component';
import { StorageService } from '@app/core/storage/storage.service';
import { LocalStorageEnums } from '@app/shared/models/local.storage.enums';
import { normalizeUserType, UserTypes } from '@app/shared/models/user-types';
import { ClientService } from '@app/features/clients/services/client.service';
import { CompanyService } from '@app/features/companies/services/company.service';
import { ProviderService } from '@app/features/providers/services/provider.service';
import { hasApiErrors } from '@app/shared/utils/api-response';
import type { ClientResponse } from '@app/features/clients/models/client.model';
import type { CompanyResponse } from '@app/features/companies/models/company.model';
import type { ProviderResponse } from '@app/features/providers/models/provider.model';
import type { MenuItem } from 'primeng/api';
import type { SidebarSection } from '@app/core/layout/models/sidebar.model';
import { MenuModule } from 'primeng/menu';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';

/** Sección del menú lateral (estilo DIAMOND: título en mayúsculas + ítems). */
export type { SidebarSection } from '@app/core/layout/models/sidebar.model';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    MenuModule,
    ToolbarModule,
    ButtonModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    AvatarModule,
    TooltipModule,
    MatchRequestsPanelComponent,
    SidebarNavComponent
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent implements OnInit {
  private authService = inject(AuthService);
  private storageService = inject(StorageService);
  private platformId = inject(PLATFORM_ID);
  private clientService = inject(ClientService);
  private companyService = inject(CompanyService);
  private providerService = inject(ProviderService);
  private router = inject(Router);
  protected readonly title = signal('LOGISAAS');
  protected readonly sectionTitle = computed(() => {
    const url = this.router.url?.split('?')[0] ?? '';
    if (url.startsWith('/dashboard')) return 'Panel de control';
    if (url.startsWith('/orders')) return 'Órdenes';
    if (url.startsWith('/clients')) return 'Clientes';
    if (url.startsWith('/companies')) return 'Empresas';
    if (url.startsWith('/providers')) return 'Providers';
    return this.title();
  });

  /** Icono de la sección actual para mostrar en el toolbar (junto al título). */
  protected readonly sectionIcon = computed(() => {
    const url = this.router.url?.split('?')[0] ?? '';
    if (url.startsWith('/dashboard')) return 'pi pi-th-large';
    if (url.startsWith('/orders')) return 'pi pi-box';
    if (url.startsWith('/clients')) return 'pi pi-users';
    if (url.startsWith('/companies')) return 'pi pi-check-circle';
    if (url.startsWith('/providers')) return 'pi pi-truck';
    return '';
  });
  protected readonly showBackLink = computed(() => !this.router.url?.startsWith('/dashboard'));
  protected readonly userType = signal<string | null>(null);
  protected readonly userEmail = signal<string | null>(null);
  protected readonly userId = signal<string | null>(null);
  protected readonly UserTypes = UserTypes;
  /** Sidebar colapsado: solo iconos. Alternar con el botón del sidebar. */
  protected readonly sidebarCollapsed = signal(false);

  /** Secciones del menú lateral (para diseño DIAMOND con títulos). */
  protected menuSections = computed<SidebarSection[]>(() => {
    const principal: { label: string; icon: string; routerLink: string | string[] }[] = [];
    const gestion: { label: string; icon: string; routerLink: string | string[] }[] = [];

    if (this.canAccess([UserTypes.ADMIN, UserTypes.COMPANY, UserTypes.PROVIDER, UserTypes.CLIENT])) {
      principal.push({ label: 'Panel de Control', icon: 'pi pi-th-large', routerLink: '/dashboard' });
    }
    if (this.canAccess([UserTypes.ADMIN, UserTypes.COMPANY, UserTypes.PROVIDER, UserTypes.CLIENT])) {
      principal.push({ label: 'Órdenes', icon: 'pi pi-box', routerLink: '/orders' });
    }

    if (this.canAccess([UserTypes.ADMIN, UserTypes.COMPANY])) {
      gestion.push({ label: 'Clientes', icon: 'pi pi-users', routerLink: '/clients' });
    }
    if (this.canAccess([UserTypes.COMPANY])) {
      gestion.push({ label: 'Grupos de Estados', icon: 'pi pi-check-circle', routerLink: '/companies/status-groups' });
    }
    if (this.canAccess([UserTypes.COMPANY]) && this.userId()) {
      gestion.push({
        label: 'Solicitudes de asignación',
        icon: 'pi pi-list',
        routerLink: ['/companies', this.userId()!, 'solicitudes-asignacion']
      });
    }
    if (this.canAccess([UserTypes.ADMIN, UserTypes.COMPANY])) {
      gestion.push({ label: 'Providers', icon: 'pi pi-truck', routerLink: '/providers' });
    }
    if (this.canAccess([UserTypes.PROVIDER]) && this.userId()) {
      gestion.push({
        label: 'Mis Vehículos',
        icon: 'pi pi-truck',
        routerLink: ['/providers', this.userId()!, 'vehicles']
      });
    }
    if (this.canAccess([UserTypes.ADMIN, UserTypes.PROVIDER])) {
      gestion.push({ label: 'Pedidos', icon: 'pi pi-list', routerLink: '/providers/orders' });
    }
    if (this.canAccess([UserTypes.PROVIDER])) {
      gestion.push({ label: 'Empresas', icon: 'pi pi-building', routerLink: '/providers/companies' });
    }
    if (this.canAccess([UserTypes.PROVIDER])) {
      gestion.push({ label: 'Usuarios Internos', icon: 'pi pi-users', routerLink: ['/providers', 'usuarios-internos'] });
    }
    if (this.canAccess([UserTypes.COMPANY]) && this.userId()) {
      gestion.push({
        label: 'Usuarios Internos',
        icon: 'pi pi-users',
        routerLink: ['/companies', this.userId()!, 'usuarios-internos']
      });
    }
    if (this.canAccess([UserTypes.CLIENT]) && this.userId()) {
      gestion.push({
        label: 'Usuarios Internos',
        icon: 'pi pi-users',
        routerLink: ['/clients', this.userId()!, 'usuarios-internos']
      });
    }
    if (this.canAccess([UserTypes.CLIENT])) {
      gestion.push({ label: 'Mis Compañías', icon: 'pi pi-building', routerLink: '/clients/companies' });
    }
    if (this.canAccess([UserTypes.ADMIN])) {
      gestion.push({ label: 'Empresas', icon: 'pi pi-calendar', routerLink: '/companies' });
    }

    const sections: SidebarSection[] = [];
    if (principal.length) sections.push({ title: 'PRINCIPAL', items: principal });
    if (gestion.length) sections.push({ title: 'GESTIÓN', items: gestion });
    return sections;
  });

  /** Modelo de menú lateral para PrimeNG p-menu (solo ítems visibles según rol). */
  protected menuItems = computed<MenuItem[]>(() => {
    const items: MenuItem[] = [];
    if (this.canAccess([UserTypes.ADMIN, UserTypes.COMPANY, UserTypes.PROVIDER, UserTypes.CLIENT])) {
      items.push({ label: 'Panel de Control', icon: 'pi pi-th-large', routerLink: '/dashboard' });
    }
    if (this.canAccess([UserTypes.ADMIN, UserTypes.COMPANY, UserTypes.PROVIDER, UserTypes.CLIENT])) {
      items.push({ label: 'Órdenes', icon: 'pi pi-box', routerLink: '/orders' });
    }
    if (this.canAccess([UserTypes.ADMIN, UserTypes.COMPANY])) {
      items.push({ label: 'Clientes', icon: 'pi pi-users', routerLink: '/clients' });
    }
    if (this.canAccess([UserTypes.COMPANY])) {
      items.push({ label: 'Grupos de Estados', icon: 'pi pi-check-circle', routerLink: '/companies/status-groups' });
    }
    if (this.canAccess([UserTypes.COMPANY]) && this.userId()) {
      items.push({
        label: 'Solicitudes de asignación',
        icon: 'pi pi-list',
        routerLink: ['/companies', this.userId()!, 'solicitudes-asignacion']
      });
    }
    if (this.canAccess([UserTypes.ADMIN, UserTypes.COMPANY])) {
      items.push({ label: 'Providers', icon: 'pi pi-truck', routerLink: '/providers' });
    }
    if (this.canAccess([UserTypes.PROVIDER]) && this.userId()) {
      items.push({
        label: 'Mis Vehículos',
        icon: 'pi pi-truck',
        routerLink: ['/providers', this.userId(), 'vehicles']
      });
    }
    if (this.canAccess([UserTypes.ADMIN, UserTypes.PROVIDER])) {
      items.push({ label: 'Pedidos', icon: 'pi pi-list', routerLink: '/providers/orders' });
    }
    if (this.canAccess([UserTypes.PROVIDER])) {
      items.push({ label: 'Empresas', icon: 'pi pi-building', routerLink: '/providers/companies' });
    }
    if (this.canAccess([UserTypes.PROVIDER])) {
      items.push({ label: 'Usuarios Internos', icon: 'pi pi-users', routerLink: ['/providers', 'usuarios-internos'] });
    }
    if (this.canAccess([UserTypes.COMPANY]) && this.userId()) {
      items.push({
        label: 'Usuarios Internos',
        icon: 'pi pi-users',
        routerLink: ['/companies', this.userId(), 'usuarios-internos']
      });
    }
    if (this.canAccess([UserTypes.CLIENT]) && this.userId()) {
      items.push({
        label: 'Usuarios Internos',
        icon: 'pi pi-users',
        routerLink: ['/clients', this.userId(), 'usuarios-internos']
      });
    }
    if (this.canAccess([UserTypes.CLIENT])) {
      items.push({ label: 'Mis Compañías', icon: 'pi pi-building', routerLink: '/clients/companies' });
    }
    if (this.canAccess([UserTypes.ADMIN])) {
      items.push({ label: 'Empresas', icon: 'pi pi-calendar', routerLink: '/companies' });
    }
    return items;
  });

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.userType.set(normalizeUserType(this.storageService.getItem(LocalStorageEnums.USER_TYPE)));
      this.userEmail.set(this.storageService.getItem(LocalStorageEnums.USER_EMAIL));
      const storedId = this.storageService.getItem(LocalStorageEnums.ID);
      this.userId.set(storedId);
      if (!storedId) {
        this.fetchAndStoreEntityId();
      }
    }
  }

  /**
   * Si el usuario es client, company o provider y no tiene ID en storage,
   * llama a getMe() para obtenerlo y así mostrar enlaces que lo requieren (ej. Usuarios internos).
   */
  private fetchAndStoreEntityId(): void {
    const userType = this.userType();
    if (!userType) return;

    const handleMe = (response: ClientResponse | CompanyResponse | ProviderResponse) => {
      if (hasApiErrors(response)) return;
      const result = response?.result as unknown as Record<string, unknown> | undefined;
      if (!result) return;
      const id =
        String(result['id'] ?? result['client_id'] ?? result['company_id'] ?? result['provider_id'] ?? '').trim() ||
        null;
      if (id) {
        this.storageService.setItem(LocalStorageEnums.ID, id);
        this.userId.set(id);
      }
    };

    if (userType === 'client') {
      this.clientService.getMe().subscribe({ next: handleMe, error: () => {} });
      return;
    }
    if (userType === 'company') {
      this.companyService.getMe().subscribe({ next: handleMe, error: () => {} });
      return;
    }
    if (userType === 'provider') {
      this.providerService.getMe().subscribe({ next: handleMe, error: () => {} });
    }
  }

  canAccess(roles: string[]): boolean {
    const currentRole = this.userType();
    if (!currentRole) {
      return false;
    }
    const normalizedRole = normalizeUserType(currentRole) ?? currentRole.toLowerCase();
    return roles.includes(normalizedRole);
  }

  getRoleLabel(): string {
    const currentRole = this.userType();
    if (!currentRole) {
      return 'Usuario';
    }
    const normalizedRole = normalizeUserType(currentRole) ?? currentRole.toLowerCase();
    const labels: Record<string, string> = {
      admin: 'Admin',
      company: 'Company',
      provider: 'Provider',
      client: 'Client',
      internal_company: 'Internal Company',
      internal_provider: 'Internal Provider',
      internal_client: 'Internal Client',
    };
    return labels[normalizedRole] ?? normalizedRole;
  }

  logout(): void {
    this.authService.logout();
  }
}







