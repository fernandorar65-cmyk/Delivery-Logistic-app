import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroIconComponent } from '../../../../../../components/hero-icon/hero-icon';
import { StatCard } from '../../vehicle-list-view.types';

@Component({
  selector: 'app-vehicles-stats',
  standalone: true,
  imports: [CommonModule, HeroIconComponent],
  templateUrl: './vehicles-stats.component.html',
  styleUrl: './vehicles-stats.component.css'
})
export class VehiclesStatsComponent {
  @Input({ required: true }) stats: StatCard[] = [];
}
