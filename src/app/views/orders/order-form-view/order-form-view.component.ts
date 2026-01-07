import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderFormComponent } from '../../../components/orders/order-form/order-form.component';

@Component({
  selector: 'app-order-form-view',
  standalone: true,
  imports: [CommonModule, OrderFormComponent],
  templateUrl: './order-form-view.component.html',
  styleUrl: './order-form-view.component.css'
})
export class OrderFormViewComponent {
}

