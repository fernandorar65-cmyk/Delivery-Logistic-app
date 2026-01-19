import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-pagination.component.html',
  styleUrl: './dashboard-pagination.component.css'
})
export class DashboardPaginationComponent {
  @Input({ required: true }) totalItems!: number;
  @Input({ required: true }) currentPage!: number;
  @Input() pageSize = 5;
  @Output() previous = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();

  get startItem() {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endItem() {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }

  get isFirstPage() {
    return this.currentPage <= 1;
  }

  get isLastPage() {
    return this.currentPage * this.pageSize >= this.totalItems;
  }
}
