import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-user-detail-view',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './user-detail-view.component.html',
  styleUrl: './user-detail-view.component.css'
})
export class UserDetailViewComponent implements OnInit {
  private userService = inject(UserService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  user = signal<User | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadUser(Number(id));
    }
  }

  loadUser(id: number) {
    this.loading.set(true);
    this.error.set(null);

    this.userService.getById(id).subscribe({
      next: (data) => {
        this.user.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar el usuario.');
        this.loading.set(false);
        console.error('Error loading user:', err);
      }
    });
  }
}

