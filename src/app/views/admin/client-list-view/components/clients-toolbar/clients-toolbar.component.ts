import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroIconComponent } from '../../../../../components/hero-icon/hero-icon';

@Component({
  selector: 'app-clients-toolbar',
  standalone: true,
  imports: [CommonModule, HeroIconComponent],
  templateUrl: './clients-toolbar.component.html',
  styleUrl: './clients-toolbar.component.css'
})
export class ClientsToolbarComponent {}
