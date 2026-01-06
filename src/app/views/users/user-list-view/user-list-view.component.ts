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
  currentPage = signal(1);
  totalCount = signal(0);
  hasNext = signal(false);
  hasPrevious = signal(false);

  constructor() {
    this.loadUsers(1);
  }

  loadUsers(page: number = 1) {
    this.loading.set(true);
    this.error.set(null);
    
    this.userService.getAll(page).subscribe({
      next: (response) => {
        this.users.set(response.results);
        this.totalCount.set(response.count);
        this.hasNext.set(response.next !== null);
        this.hasPrevious.set(response.previous !== null);
        this.currentPage.set(page);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar los usuarios. Por favor, intente nuevamente.');
        this.loading.set(false);
        console.error('Error loading users:', err);
      }
    });
  }

  nextPage() {
    if (this.hasNext()) {
      this.loadUsers(this.currentPage() + 1);
    }
  }

  previousPage() {
    if (this.hasPrevious()) {
      this.loadUsers(this.currentPage() - 1);
    }
  }
}

