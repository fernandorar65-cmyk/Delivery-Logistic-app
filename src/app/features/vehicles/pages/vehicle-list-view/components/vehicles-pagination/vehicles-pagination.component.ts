import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-vehicles-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vehicles-pagination.component.html',
  styleUrl: './vehicles-pagination.component.css'
})
export class VehiclesPaginationComponent {
  @Input() startItem = 0;
  @Input() endItem = 0;
  @Input() totalItems = 0;
  @Input() currentPage = 1;
  @Input() totalPages = 1;
  @Input() pages: number[] = [];

  @Output() previous = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();
  @Output() goTo = new EventEmitter<number>();
}






