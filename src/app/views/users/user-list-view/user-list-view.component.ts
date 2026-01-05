import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-user-list-view',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './user-list-view.component.html',
  styleUrl: './user-list-view.component.css'
})
export class UserListViewComponent {
  private userService = inject(UserService);
  
  users = signal<User[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading.set(true);
    this.error.set(null);
    
    this.userService.getAll().subscribe({
      next: (data) => {
        this.users.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar los usuarios. Por favor, intente nuevamente.');
        this.loading.set(false);
        console.error('Error loading users:', err);
      }
    });
  }
}

