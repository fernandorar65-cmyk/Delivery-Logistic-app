import { Component, signal, inject, PLATFORM_ID, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '@app/core/auth/services/auth.service';
import { HeroIconComponent } from '@app/shared/ui/hero-icon/hero-icon';
import { MatchRequestsPanelComponent } from '@app/core/layout/components/match-requests-panel/match-requests-panel.component';
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

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, HeroIconComponent, MatchRequestsPanelComponent],
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
  protected readonly title = signal('LOGISAAS');
  protected readonly userType = signal<string | null>(null);
  protected readonly userEmail = signal<string | null>(null);
  protected readonly userId = signal<string | null>(null);
  protected readonly UserTypes = UserTypes;

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







