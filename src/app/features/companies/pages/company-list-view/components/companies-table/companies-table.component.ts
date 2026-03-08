import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { Company } from '@app/features/companies/models/company.model';

@Component({
  selector: 'app-companies-table',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    TagModule,
    ButtonModule,
    TooltipModule
  ],
  templateUrl: './companies-table.component.html',
  styleUrl: './companies-table.component.css'
})
export class CompaniesTableComponent {
  @Input() companies: Company[] = [];
  @Input() getCompanyInitials!: (name: string) => string;
  @Input() getSectorClass!: (sector?: string) => string;
  @Input() getStatusClass!: (status?: string) => string;
  @Input() getStatusLabel!: (status?: string) => string;

  @Output() edit = new EventEmitter<Company>();
  @Output() remove = new EventEmitter<string>();
  @Output() uploadOrder = new EventEmitter<Company>();
  @Output() solicitudesAsignacion = new EventEmitter<Company>();
}
