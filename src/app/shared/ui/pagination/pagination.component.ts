import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.css'
})
export class PaginationComponent {
  @Input() totalItems = 0;
  @Input() currentPage = 1;
  @Input() pageSize = 10;
  @Input() startItem?: number;
  @Input() endItem?: number;
  @Input() totalPages?: number;
  @Input() pages: (number | string)[] = [];
  @Input() hasPrevious?: boolean;
  @Input() hasNext?: boolean;
  @Input() itemLabel = 'registro';
  @Input() itemLabelPlural = 'registros';

  @Output() previous = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();
  @Output() goTo = new EventEmitter<number>();

  get resolvedStartItem(): number {
    if (this.totalItems === 0) {
      return 0;
    }
    if (typeof this.startItem === 'number') {
      return this.startItem;
    }
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get resolvedEndItem(): number {
    if (this.totalItems === 0) {
      return 0;
    }
    if (typeof this.endItem === 'number') {
      return this.endItem;
    }
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }

  get resolvedTotalPages(): number {
    if (typeof this.totalPages === 'number') {
      return this.totalPages;
    }
    return Math.max(1, Math.ceil(this.totalItems / this.pageSize));
  }

  get canPrevious(): boolean {
    if (typeof this.hasPrevious === 'boolean') {
      return this.hasPrevious;
    }
    return this.currentPage > 1;
  }

  get canNext(): boolean {
    if (typeof this.hasNext === 'boolean') {
      return this.hasNext;
    }
    return this.currentPage < this.resolvedTotalPages;
  }

  get resolvedLabel(): string {
    return this.totalItems === 1 ? this.itemLabel : this.itemLabelPlural;
  }

  isPageNumber(page: number | string): page is number {
    return typeof page === 'number';
  }
}
