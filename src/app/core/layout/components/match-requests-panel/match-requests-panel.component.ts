import { Component, ElementRef, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HeroIconComponent } from '@app/shared/ui/hero-icon/hero-icon';

interface MatchRequest {
  id: string;
  company: string;
  detail: string;
  time: string;
  icon: string;
  tone: string;
}

@Component({
  selector: 'app-match-requests-panel',
  standalone: true,
  imports: [CommonModule, RouterLink, HeroIconComponent],
  templateUrl: './match-requests-panel.component.html',
  styleUrl: './match-requests-panel.component.css'
})
export class MatchRequestsPanelComponent {
  isOpen = signal(false);

  requests: MatchRequest[] = [
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
  ];

  constructor(private elementRef: ElementRef) {}

  togglePanel() {
    this.isOpen.update(value => !value);
  }

  closePanel() {
    this.isOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  handleClick(event: MouseEvent) {
    if (!this.isOpen()) return;
    const target = event.target as HTMLElement;
    if (!this.elementRef.nativeElement.contains(target)) {
      this.isOpen.set(false);
    }
  }
}






