import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-vehicles-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    SelectModule
  ],
  templateUrl: './vehicles-filters.component.html',
  styleUrl: './vehicles-filters.component.css'
})
export class VehiclesFiltersComponent {
  @Input() searchQuery = '';
  @Input() vehicleTypeFilter = '';

  @Output() searchQueryChange = new EventEmitter<string>();
  @Output() vehicleTypeChange = new EventEmitter<string>();

  typeOptions = [
    { label: 'Tipo de Vehículo', value: '' },
    { label: 'Camión Pesado', value: 'truck' },
    { label: 'Van de Reparto', value: 'van' },
    { label: 'Motocicleta Cargo', value: 'motorcycle' },
    { label: 'Tractor-remolque', value: 'tractor-trailer' }
  ];
}
