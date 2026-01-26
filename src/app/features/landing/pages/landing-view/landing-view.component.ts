import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing-view',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './landing-view.component.html',
  styleUrl: './landing-view.component.css'
})
export class LandingViewComponent {}
