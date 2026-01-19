import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroIconComponent } from '../../../../../components/hero-icon/hero-icon';
import { Company } from '../../../../../models/company.model';

@Component({
  selector: 'app-companies-table',
  standalone: true,
  imports: [CommonModule, HeroIconComponent],
  templateUrl: './companies-table.component.html',
  styleUrl: './companies-table.component.css'
})
export class CompaniesTableComponent {
  @Input() companies: Company[] = [];
  @Input() getCompanyColor!: (name: string) => string;
  @Input() getCompanyInitials!: (name: string) => string;
  @Input() getSectorClass!: (sector?: string) => string;
  @Input() getStatusClass!: (status?: string) => string;
  @Input() getStatusLabel!: (status?: string) => string;

  @Output() edit = new EventEmitter<Company>();
  @Output() remove = new EventEmitter<string>();
}
