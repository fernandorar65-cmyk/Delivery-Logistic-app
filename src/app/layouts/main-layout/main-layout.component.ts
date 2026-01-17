import { Component, signal, inject, PLATFORM_ID, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HeroIconComponent } from '../../components/hero-icon/hero-icon';
import { MatchRequestsPanelComponent } from '../../components/match-requests-panel/match-requests-panel.component';
import { StorageService } from '../../services/storage.service';

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

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.userType.set(this.storageService.getItem('user_type'));
    }
  }

  canAccess(roles: string[]): boolean {
    const currentRole = this.userType();
    if (!currentRole) {
      return false;
    }
    const normalizedRole = currentRole === 'platform' ? 'admin' : currentRole;
    return roles.includes(normalizedRole);
  }

  getRoleLabel(): string {
    const currentRole = this.userType();
    if (!currentRole) {
      return 'Usuario';
    }
    const labels: Record<string, string> = {
      admin: 'platform',
      company: 'company',
      provider: 'provider',
      client: 'client',
    };
    return labels[currentRole] ?? currentRole;
  }

  logout(): void {
    this.authService.logout();
  }
}

