import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroIconComponent } from '../../../components/hero-icon/hero-icon';

interface SuggestedMatch {
  id: string;
  name: string;
  location: string;
  category: string;
  match: number;
  icon: string;
  tone: string;
  actionLabel: string;
  actionIcon: string;
  actionClass: string;
}

interface MatchRow {
  id: string;
  name: string;
  code: string;
  category: string;
  categoryTone: string;
  location: string;
  activity: number;
  icon: string;
  tone: string;
  actionLabel: string;
  actionIcon: string;
  actionClass: string;
}

interface StatCard {
  id: string;
  label: string;
  value: string;
  icon: string;
  tone: string;
}

@Component({
  selector: 'app-client-matching-view',
  standalone: true,
  imports: [CommonModule, HeroIconComponent],
  templateUrl: './client-matching-view.component.html',
  styleUrl: './client-matching-view.component.css'
})
export class ClientMatchingViewComponent {
  sectors = ['Todos', 'Transporte Marítimo', 'Última Milla', 'Almacenamiento', 'Aéreo', 'Multimodal'];
  regions = ['Global', 'Latinoamérica', 'Europa', 'Asia', 'Norteamérica'];
  statuses = ['Todos', 'Sin Match', 'Pendiente', 'Conectado'];

  recentTags = ['Logística portuaria', 'Cadena frío', 'Cross-border'];

  suggestedMatches: SuggestedMatch[] = [
    {
      id: '1',
      name: 'Atlántico Shipping',
      location: 'Buenos Aires · AR',
      category: 'Transporte marítimo',
      match: 82,
      icon: 'truck',
      tone: 'tone-blue',
      actionLabel: 'Conectar',
      actionIcon: 'arrow-right',
      actionClass: 'action-primary'
    },
    {
      id: '2',
      name: 'ColdChain Hub',
      location: 'Santiago · CL',
      category: 'Almacenamiento',
      match: 74,
      icon: 'hexagon',
      tone: 'tone-teal',
      actionLabel: 'En revisión',
      actionIcon: 'clock',
      actionClass: 'action-muted'
    },
    {
      id: '3',
      name: 'Ruta Express',
      location: 'Lima · PE',
      category: 'Última milla',
      match: 68,
      icon: 'truck',
      tone: 'tone-orange',
      actionLabel: 'Enviando',
      actionIcon: 'arrow-right-on-rectangle',
      actionClass: 'action-neutral'
    }
  ];

  matchesTable: MatchRow[] = [
    {
      id: '1',
      name: 'Global Logística S.A.',
      code: '#GL-9921',
      category: 'Transporte Marítimo',
      categoryTone: 'pill-blue',
      location: 'Buenos Aires, AR',
      activity: 85,
      icon: 'truck',
      tone: 'tone-blue',
      actionLabel: 'Enviar Match',
      actionIcon: 'arrow-right',
      actionClass: 'action-primary'
    },
    {
      id: '2',
      name: 'InterModal Pro',
      code: '#IM-4410',
      category: 'Last Mile',
      categoryTone: 'pill-orange',
      location: 'São Paulo, BR',
      activity: 60,
      icon: 'truck',
      tone: 'tone-orange',
      actionLabel: 'Enviando...',
      actionIcon: 'arrow-right-on-rectangle',
      actionClass: 'action-disabled'
    },
    {
      id: '3',
      name: 'Almacenes Frío',
      code: '#AF-2287',
      category: 'Almacenamiento',
      categoryTone: 'pill-teal',
      location: 'Santiago, CL',
      activity: 95,
      icon: 'hexagon',
      tone: 'tone-teal',
      actionLabel: 'Pendiente',
      actionIcon: 'clock',
      actionClass: 'action-outline'
    },
    {
      id: '4',
      name: 'Carga Veloz',
      code: '#CV-0112',
      category: 'Aéreo',
      categoryTone: 'pill-purple',
      location: 'Bogotá, CO',
      activity: 45,
      icon: 'bolt',
      tone: 'tone-purple',
      actionLabel: 'Conectado',
      actionIcon: 'check-circle',
      actionClass: 'action-success'
    },
    {
      id: '5',
      name: 'Puerto Seco Norte',
      code: '#PS-8843',
      category: 'Multimodal',
      categoryTone: 'pill-indigo',
      location: 'Monterrey, MX',
      activity: 75,
      icon: 'truck',
      tone: 'tone-indigo',
      actionLabel: 'Enviar Match',
      actionIcon: 'arrow-right',
      actionClass: 'action-primary'
    }
  ];

  stats: StatCard[] = [
    { id: '1', label: 'Potencial de Red', value: '4.2k', icon: 'chart-bar', tone: 'tone-blue' },
    { id: '2', label: 'Matches Activos', value: '128', icon: 'check-circle', tone: 'tone-green' },
    { id: '3', label: 'Pendientes de Respuesta', value: '42', icon: 'clock', tone: 'tone-orange' }
  ];
}
