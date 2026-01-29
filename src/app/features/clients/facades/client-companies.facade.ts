import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ClientService } from '@app/features/clients/services/client.service';
import { ClientCompany } from '@app/features/clients/models/client-company.model';
import { CompanyRequestPending } from '@app/features/clients/models/company-request-pending.model';
import { hasApiErrors } from '@app/shared/utils/api-response';

export interface ClientCompanyView {
  id: string;
  name: string;
  status: 'active' | 'pending' | 'inactive';
  since: string;
  companyId: string;
  industry: string;
}

@Injectable({ providedIn: 'root' })
export class ClientCompaniesFacade {
  private clientService = inject(ClientService);

  loadCompanies(): Observable<ClientCompanyView[]> {
    return this.clientService.getMyCompanies().pipe(
      map((response) => {
        if (hasApiErrors(response)) {
          throw new Error('No se pudieron cargar las compañías.');
        }
        const items = Array.isArray(response?.result) ? response.result : [];
        return items.map((item) => this.mapCompanyToView(item));
      })
    );
  }

  loadPendingCompanies(): Observable<ClientCompanyView[]> {
    return this.clientService.getPendingCompanyClients().pipe(
      map((response) => {
        if (hasApiErrors(response)) {
          throw new Error('No se pudieron cargar las solicitudes pendientes.');
        }
        const items = Array.isArray(response?.result) ? response.result : [];
        return items.map((item) => this.mapPendingToView(item));
      })
    );
  }

  private mapCompanyToView(item: ClientCompany): ClientCompanyView {
    return {
      id: item.id,
      name: item.company_name,
      status: this.mapStatus(item.status),
      since: this.formatDate(item.created_at),
      companyId: item.company_id,
      industry: 'Sin rubro'
    };
  }

  private mapPendingToView(item: CompanyRequestPending): ClientCompanyView {
    return {
      id: item.id,
      name: item.company_name,
      status: 'pending',
      since: this.formatDate(item.created_at),
      companyId: item.company_id,
      industry: 'Solicitud pendiente'
    };
  }

  private mapStatus(status?: string): ClientCompanyView['status'] {
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
