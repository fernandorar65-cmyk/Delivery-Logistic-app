import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Client } from '@app/features/clients/models/client.model';

@Component({
  selector: 'app-client-detail-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './client-detail-card.component.html',
  styleUrl: './client-detail-card.component.css'
})
export class ClientDetailCardComponent {
  @Input({ required: true }) client!: Client;
}






