import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-clients-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './clients-pagination.component.html',
  styleUrl: './clients-pagination.component.css'
})
export class ClientsPaginationComponent {
  @Input() currentCount = 0;
  @Input() totalCount = 0;
  @Input() hasPrevious = false;
  @Input() hasNext = false;

  @Output() previous = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();
}
