import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DriverService } from '../../../services/driver.service';
import { Driver } from '../../../models/driver.model';

@Component({
  selector: 'app-driver-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './driver-detail.component.html',
  styleUrl: './driver-detail.component.css'
})
export class DriverDetailComponent implements OnInit {
  private driverService = inject(DriverService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  driver = signal<Driver | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadDriver(id);
    }
  }

  loadDriver(id: string) {
    this.loading.set(true);
    this.error.set(null);

    this.driverService.getById(id).subscribe({
      next: (data) => {
        this.driver.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar el conductor.');
        this.loading.set(false);
        console.error('Error loading driver:', err);
      }
    });
  }
}

