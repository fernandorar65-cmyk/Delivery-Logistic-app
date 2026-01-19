import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-companies-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './companies-pagination.component.html',
  styleUrl: './companies-pagination.component.css'
})
export class CompaniesPaginationComponent {
  @Input() startItem = 0;
  @Input() endItem = 0;
  @Input() totalItems = 0;
  @Input() currentPage = 1;
  @Input() totalPages = 1;
  @Input() pages: (number | string)[] = [];

  @Output() previous = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();
  @Output() goTo = new EventEmitter<number>();

  isPageNumber(page: number | string): page is number {
    return typeof page === 'number';
  }
}
