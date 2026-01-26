import { Component, signal, inject, PLATFORM_ID, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '@app/core/auth/services/auth.service';
import { HeroIconComponent } from '@app/shared/ui/hero-icon/hero-icon';
import { MatchRequestsPanelComponent } from '@app/core/layout/components/match-requests-panel/match-requests-panel.component';
import { StorageService } from '@app/core/storage/storage.service';
import { LocalStorageEnums } from '@app/shared/models/local.storage.enums';
import { UserTypes } from '@app/shared/models/user-types';

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
  protected readonly title = signal('LOGISAAS');
  protected readonly userType = signal<string | null>(null);
  protected readonly userEmail = signal<string | null>(null);
  protected readonly userId = signal<string | null>(null);
  protected readonly UserTypes = UserTypes;

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.userType.set(this.storageService.getItem(LocalStorageEnums.USER_TYPE));
      this.userEmail.set(this.storageService.getItem(LocalStorageEnums.USER_EMAIL));
      this.userId.set(this.storageService.getItem(LocalStorageEnums.ID));
    }
  }

  canAccess(roles: string[]): boolean {
    const currentRole = this.userType();
    if (!currentRole) {
      return false;
    }
    const normalizedRole = currentRole.toLowerCase() === 'platform'
      ? 'admin'
      : currentRole.toLowerCase();
    return roles.includes(normalizedRole);
  }

  getRoleLabel(): string {
    const currentRole = this.userType();
    if (!currentRole) {
      return 'Usuario';
    }
    const normalizedRole = currentRole.toLowerCase() === 'platform'
      ? 'admin'
      : currentRole.toLowerCase();
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







