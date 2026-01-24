import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroIconComponent } from '@app/shared/ui/hero-icon/hero-icon';

@Component({
  selector: 'app-clients-stats',
  standalone: true,
  imports: [CommonModule, HeroIconComponent],
  templateUrl: './clients-stats.component.html',
  styleUrl: './clients-stats.component.css'
})
export class ClientsStatsComponent {
  @Input() totalCount = 0;
  @Input() currentCount = 0;
}






