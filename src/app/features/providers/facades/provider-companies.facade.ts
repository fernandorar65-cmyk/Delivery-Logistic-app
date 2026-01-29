import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ProviderService } from '@app/features/providers/services/provider.service';
import { ProviderCompany } from '@app/features/providers/models/provider-company.model';
import { hasApiErrors } from '@app/shared/utils/api-response';

export interface ProviderCompanyView {
  id: string;
  name: string;
  industry: string;
  status: 'active' | 'pending' | 'inactive';
  since: string;
  companyId: string;
}

@Injectable({ providedIn: 'root' })
export class ProviderCompaniesFacade {
  private providerService = inject(ProviderService);

  loadCompanies(): Observable<ProviderCompanyView[]> {
    return this.providerService.getMyCompanies().pipe(
      map((response) => {
        if (hasApiErrors(response)) {
          throw new Error('No se pudieron cargar las compañías.');
        }
        const items = Array.isArray(response?.result) ? response.result : [];
        return items.map((item) => this.mapToView(item));
      })
    );
  }

  private mapToView(item: ProviderCompany): ProviderCompanyView {
    return {
      id: item.id,
      name: item.company_name,
      industry: 'Logística',
      status: this.mapStatus(item.status),
      since: this.formatDate(item.created_at),
      companyId: item.company_id
    };
  }

  private mapStatus(status?: string): ProviderCompanyView['status'] {
    if (status === 'accepted' || status === 'active') {
      return 'active';
    }
    if (status === 'pending') {
      return 'pending';
    }
    return 'inactive';
  }

  private formatDate(value?: string): string {
    if (!value) {
      return '';
    }
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }
    return parsed.toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  }
}
