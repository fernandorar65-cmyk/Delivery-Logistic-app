import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '@app/shared/ui/modal/modal.component';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-clients-success-modal',
  standalone: true,
  imports: [CommonModule, ModalComponent, ButtonModule],
  templateUrl: './clients-success-modal.component.html',
  styleUrl: './clients-success-modal.component.css'
})
export class ClientsSuccessModalComponent {
  @Output() close = new EventEmitter<void>();
}






