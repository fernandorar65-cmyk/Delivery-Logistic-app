import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeroIconComponent } from '../../../../../components/hero-icon/hero-icon';

@Component({
  selector: 'app-providers-toolbar',
  standalone: true,
  imports: [CommonModule, FormsModule, HeroIconComponent],
  templateUrl: './providers-toolbar.component.html',
  styleUrl: './providers-toolbar.component.css'
})
export class ProvidersToolbarComponent {
  @Input() searchQuery = '';
  @Output() searchQueryChange = new EventEmitter<string>();
}
