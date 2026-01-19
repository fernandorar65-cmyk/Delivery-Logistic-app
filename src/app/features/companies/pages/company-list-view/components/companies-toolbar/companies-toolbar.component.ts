import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroIconComponent } from '@app/shared/ui/hero-icon/hero-icon';

export interface ActiveFilter {
  type: string;
  value: string;
}

@Component({
  selector: 'app-companies-toolbar',
  standalone: true,
  imports: [CommonModule, HeroIconComponent],
  templateUrl: './companies-toolbar.component.html',
  styleUrl: './companies-toolbar.component.css'
})
export class CompaniesToolbarComponent {
  @Input() searchQuery = '';
  @Input() activeFilters: ActiveFilter[] = [];
  @Input() sectors: string[] = [];
  @Input() cities: string[] = [];
  @Input() selectedSector = 'all';
  @Input() selectedCity = 'all';

  @Output() searchChange = new EventEmitter<string>();
  @Output() removeFilter = new EventEmitter<string>();
  @Output() clearFilters = new EventEmitter<void>();
  @Output() sectorChange = new EventEmitter<string>();
  @Output() cityChange = new EventEmitter<string>();

  onSearchInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchChange.emit(target.value);
  }

  onSectorSelect(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.sectorChange.emit(target.value);
  }

  onCitySelect(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.cityChange.emit(target.value);
  }
}






