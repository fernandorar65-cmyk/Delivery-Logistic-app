import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HeroIconComponent } from '../../../../../components/hero-icon/hero-icon';
import { Client } from '../../../../../models/client.model';

@Component({
  selector: 'app-clients-table',
  standalone: true,
  imports: [CommonModule, RouterLink, HeroIconComponent],
  templateUrl: './clients-table.component.html',
  styleUrl: './clients-table.component.css'
})
export class ClientsTableComponent {
  @Input() loading = false;
  @Input() error: string | null = null;
  @Input() clients: Client[] = [];

  @Output() createRequested = new EventEmitter<void>();
  @Output() edit = new EventEmitter<Client>();
  @Output() remove = new EventEmitter<string>();

  getInitials(name: string): string {
    const words = name?.trim().split(/\s+/) ?? [];
    if (words.length === 0) return '--';
    const first = words[0]?.[0] ?? '';
    const second = words.length > 1 ? words[1]?.[0] ?? '' : words[0]?.[1] ?? '';
    return (first + second).toUpperCase();
  }

  getAvatarStyle(name: string) {
    const palette = [
      { bg: '#e0f2fe', text: '#0369a1' },
      { bg: '#ede9fe', text: '#6d28d9' },
      { bg: '#dbeafe', text: '#1d4ed8' },
      { bg: '#fee2e2', text: '#b91c1c' },
      { bg: '#dcfce7', text: '#15803d' }
    ];
    const index = Math.abs(this.hashCode(name)) % palette.length;
    return {
      'background-color': palette[index].bg,
      color: palette[index].text
    };
  }

  private hashCode(value: string): number {
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      hash = (hash << 5) - hash + value.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }
}
