import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ModalComponent } from '@app/shared/ui/modal/modal.component';
import { VEHICLE_BRANDS_PERU } from '@app/features/vehicles/constants/vehicle-brands';
import { VEHICLE_COLORS_PERU } from '@app/features/vehicles/constants/vehicle-colors';

interface SelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-vehicles-edit-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AutoCompleteModule,
    ModalComponent
  ],
  templateUrl: './vehicles-edit-modal.component.html',
  styleUrl: './vehicles-edit-modal.component.css'
})
export class VehiclesEditModalComponent {
  @Input({ required: true }) editForm!: FormGroup;
  @Input({ required: true }) vehicleTypes!: SelectOption[];
  @Input({ required: true }) statusOptions!: SelectOption[];
  @Input() editLoading = false;
  @Input() editError: string | null = null;
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






