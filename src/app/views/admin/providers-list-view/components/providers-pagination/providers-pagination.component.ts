import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-providers-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './providers-pagination.component.html',
  styleUrl: './providers-pagination.component.css'
})
export class ProvidersPaginationComponent {
  @Input() startItem = 0;
  @Input() endItem = 0;
  @Input() totalItems = 0;
  @Input() currentPage = 1;
  @Input() totalPages = 1;

  @Output() previous = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();
}
