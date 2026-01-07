import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OperationFormComponent } from '../../../components/operations/operation-form/operation-form.component';

@Component({
  selector: 'app-operation-form-view',
  standalone: true,
  imports: [CommonModule, OperationFormComponent],
  templateUrl: './operation-form-view.component.html',
  styleUrl: './operation-form-view.component.css'
})
export class OperationFormViewComponent {
}

