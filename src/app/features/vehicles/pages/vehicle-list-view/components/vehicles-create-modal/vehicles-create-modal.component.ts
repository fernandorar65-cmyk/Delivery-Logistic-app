import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { HeroIconComponent } from '@app/shared/ui/hero-icon/hero-icon';
import { ModalComponent } from '@app/shared/ui/modal/modal.component';
import { VEHICLE_BRANDS_PERU } from '@app/features/vehicles/constants/vehicle-brands';
import { VEHICLE_FUEL_TYPES_PERU } from '@app/features/vehicles/constants/vehicle-fuel-types';
import { VEHICLE_COLORS_PERU } from '@app/features/vehicles/constants/vehicle-colors';

interface SelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-vehicles-create-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HeroIconComponent,
    ModalComponent,
    InputTextModule,
    SelectModule,
    ButtonModule,
    MessageModule,
    AutoCompleteModule
  ],
  templateUrl: './vehicles-create-modal.component.html',
  styleUrl: './vehicles-create-modal.component.css'
})
export class VehiclesCreateModalComponent {
  @Input({ required: true }) createForm!: FormGroup;
  @Input({ required: true }) vehicleTypes!: SelectOption[];
  @Input({ required: true }) statusOptions!: SelectOption[];
  @Input({ required: true }) providerLabel!: string;
  @Input() createLoading = false;
  @Input() createError: string | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<void>();

  readonly allBrands = [...VEHICLE_BRANDS_PERU];
  filteredBrands: string[] = [];

  filterBrands(event: { query: string }): void {
    const query = (event.query ?? '').trim().toLowerCase();
    if (!query) {
      this.filteredBrands = [...this.allBrands];
      return;
    }
    this.filteredBrands = this.allBrands.filter((brand) =>
      brand.toLowerCase().includes(query)
    );
  }

  readonly allFuelTypes = [...VEHICLE_FUEL_TYPES_PERU];
  filteredFuelTypes: string[] = [];

  filterFuelTypes(event: { query: string }): void {
    const query = (event.query ?? '').trim().toLowerCase();
    if (!query) {
      this.filteredFuelTypes = [...this.allFuelTypes];
      return;
    }
    this.filteredFuelTypes = this.allFuelTypes.filter((fuel) =>
      fuel.toLowerCase().includes(query)
    );
  }

  readonly allColors = [...VEHICLE_COLORS_PERU];
  filteredColors: string[] = [];

  filterColors(event: { query: string }): void {
    const query = (event.query ?? '').trim().toLowerCase();
    if (!query) {
      this.filteredColors = [...this.allColors];
      return;
    }
    this.filteredColors = this.allColors.filter((color) =>
      color.toLowerCase().includes(query)
    );
  }
}






