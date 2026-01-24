import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroIconComponent } from '@app/shared/ui/hero-icon/hero-icon';
import { EmptyStateComponent } from '@app/shared/ui/empty-state/empty-state.component';

interface MatchRequest {
  id: string;
  company: string;
  detail: string;
  time: string;
  icon: string;
  tone: string;
}

@Component({
  selector: 'app-match-requests-view',
  standalone: true,
  imports: [CommonModule, HeroIconComponent, EmptyStateComponent],
  templateUrl: './match-requests-view.component.html',
  styleUrl: './match-requests-view.component.css'
})
export class MatchRequestsViewComponent {
  requests = signal<MatchRequest[]>([
    {
      id: '1',
      company: 'Global Logistics S.A.',
      detail: 'Transporte Marítimo · Internacional',
      time: 'Hace 2 horas',
      icon: 'truck',
      tone: 'tone-blue'
    },
    {
      id: '2',
      company: 'EcoFreight Solutions',
      detail: 'Sostenibilidad · Carga Terrestre',
      time: 'Hoy 08:15 AM',
      icon: 'shield-check',
      tone: 'tone-green'
    },
    {
      id: '3',
      company: 'Skyline Air Cargo',
      detail: 'Logística Aérea · Express',
      time: 'Ayer',
      icon: 'bolt',
      tone: 'tone-purple'
    }
  ]);

  acceptRequest(requestId: string) {
    this.requests.update(items => items.filter(item => item.id !== requestId));
  }

  rejectRequest(requestId: string) {
    this.requests.update(items => items.filter(item => item.id !== requestId));
  }
}
