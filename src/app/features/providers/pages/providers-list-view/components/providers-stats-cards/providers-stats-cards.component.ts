import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroIconComponent } from '@app/shared/ui/hero-icon/hero-icon';
import { StatCard } from '../../providers-list-view.types';

@Component({
  selector: 'app-providers-stats-cards',
  standalone: true,
  imports: [CommonModule, HeroIconComponent],
  templateUrl: './providers-stats-cards.component.html',
  styleUrl: './providers-stats-cards.component.css'
})
export class ProvidersStatsCardsComponent {
  @Input({ required: true }) stats: StatCard[] = [];
}






