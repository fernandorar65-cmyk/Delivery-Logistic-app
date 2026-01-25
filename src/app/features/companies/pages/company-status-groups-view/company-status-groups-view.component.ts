import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroIconComponent } from '@app/shared/ui/hero-icon/hero-icon';

type StatusTag = {
  label: string;
  tone: 'green' | 'blue' | 'amber' | 'indigo' | 'cyan' | 'orange' | 'gray';
};

type StatusGroup = {
  title: string;
  description: string;
  icon: string;
  iconTone: 'primary' | 'purple' | 'orange';
  statuses: StatusTag[];
  shipments: string;
  updatedAt: string;
  members: string[];
};

@Component({
  selector: 'app-company-status-groups-view',
  standalone: true,
  imports: [CommonModule, HeroIconComponent],
  templateUrl: './company-status-groups-view.component.html',
  styleUrl: './company-status-groups-view.component.css'
})
export class CompanyStatusGroupsViewComponent {
  groups: StatusGroup[] = [
    {
      title: 'Flujo Estándar Nacional',
      description: 'Configuración base para entregas terrestres en territorio nacional.',
      icon: 'truck',
      iconTone: 'primary',
      statuses: [
        { label: 'Recogido', tone: 'green' },
        { label: 'En Almacén', tone: 'blue' },
        { label: 'En Tránsito', tone: 'amber' },
        { label: 'Entregado', tone: 'indigo' }
      ],
      shipments: '1,245',
      updatedAt: 'Hace 2 días',
      members: ['JD', 'AL', '+3']
    },
    {
      title: 'Cadena de Frío / Perecederos',
      description: 'Control de temperatura estricto y priorización de entrega rápida.',
      icon: 'bolt',
      iconTone: 'purple',
      statuses: [
        { label: 'Recogido', tone: 'green' },
        { label: 'Control Temp OK', tone: 'cyan' },
        { label: 'Despacho Prioritario', tone: 'amber' },
        { label: 'Última Milla', tone: 'orange' },
        { label: 'Entregado', tone: 'indigo' }
      ],
      shipments: '86',
      updatedAt: 'Ayer, 18:45',
      members: ['CM']
    },
    {
      title: 'Internacional (Multimodal)',
      description: 'Estados específicos para procesos de aduana y transporte marítimo/aéreo.',
      icon: 'chart-bar',
      iconTone: 'orange',
      statuses: [
        { label: 'Origen', tone: 'gray' },
        { label: 'Trámites Aduana', tone: 'orange' },
        { label: 'En Tránsito Marítimo', tone: 'blue' },
        { label: 'Entregado', tone: 'indigo' }
      ],
      shipments: '432',
      updatedAt: 'Hace 1 mes',
      members: ['GL', 'EX']
    }
  ];

  getToneClass(tone: StatusTag['tone']): string {
    switch (tone) {
      case 'green':
        return 'tag tag-green';
      case 'blue':
        return 'tag tag-blue';
      case 'amber':
        return 'tag tag-amber';
      case 'indigo':
        return 'tag tag-indigo';
      case 'cyan':
        return 'tag tag-cyan';
      case 'orange':
        return 'tag tag-orange';
      default:
        return 'tag tag-gray';
    }
  }

  getIconToneClass(tone: StatusGroup['iconTone']): string {
    switch (tone) {
      case 'purple':
        return 'icon-badge icon-purple';
      case 'orange':
        return 'icon-badge icon-orange';
      default:
        return 'icon-badge icon-primary';
    }
  }
}
