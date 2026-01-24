import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeroIconComponent } from '@app/shared/ui/hero-icon/hero-icon';

@Component({
  selector: 'app-vehicles-filters',
  standalone: true,
  imports: [CommonModule, FormsModule, HeroIconComponent],
  templateUrl: './vehicles-filters.component.html',
  styleUrl: './vehicles-filters.component.css'
})
export class VehiclesFiltersComponent {
  @Input() searchQuery = '';
  @Input() vehicleTypeFilter = '';

  @Output() searchQueryChange = new EventEmitter<string>();
  @Output() vehicleTypeChange = new EventEmitter<string>();
}






