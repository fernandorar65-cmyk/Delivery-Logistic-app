import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-user-form-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './user-form-view.component.html',
  styleUrl: './user-form-view.component.css'
})
export class UserFormViewComponent implements OnInit {
  private userService = inject(UserService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEditMode = signal(false);
  userId = signal<number | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  userForm: FormGroup = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', this.isEditMode() ? [] : [Validators.required, Validators.minLength(8)]],
    first_name: [''],
    last_name: [''],
    is_active: [true]
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && this.route.snapshot.url.some(segment => segment.path === 'edit')) {
      this.isEditMode.set(true);
      this.userId.set(Number(id));
      // En modo edición, la contraseña no es requerida
      this.userForm.get('password')?.clearValidators();
      this.userForm.get('password')?.updateValueAndValidity();
      this.loadUser(Number(id));
    }
  }

  loadUser(id: number) {
    this.loading.set(true);
    this.userService.getById(id).subscribe({
      next: (user) => {
        this.userForm.patchValue({
          username: user.username,
          email: user.email,
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          is_active: user.is_active ?? true
        });
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar el usuario.');
        this.loading.set(false);
        console.error('Error loading user:', err);
      }
    });
  }

  onSubmit() {
    if (this.userForm.valid) {
      this.loading.set(true);
      this.error.set(null);

      const formValue = { ...this.userForm.value };
      // Si estamos editando y no hay contraseña, no la enviamos
      if (this.isEditMode() && !formValue.password) {
        delete formValue.password;
      }

      if (this.isEditMode() && this.userId()) {
        this.userService.update(this.userId()!, formValue).subscribe({
          next: () => {
            this.router.navigate(['/users', this.userId()]);
          },
          error: (err) => {
            this.error.set('Error al actualizar el usuario.');
            this.loading.set(false);
            console.error('Error updating user:', err);
          }
        });
      } else {
        this.userService.create(formValue).subscribe({
          next: (user) => {
            this.router.navigate(['/users', user.id]);
          },
          error: (err) => {
            this.error.set('Error al crear el usuario.');
            this.loading.set(false);
            console.error('Error creating user:', err);
          }
        });
      }
    } else {
      this.userForm.markAllAsTouched();
    }
  }

  getFieldError(fieldName: string): string {
    const field = this.userForm.get(fieldName);
    if (field?.hasError('required')) {
      return 'Este campo es requerido';
    }
    if (field?.hasError('email')) {
      return 'Email inválido';
    }
    if (field?.hasError('minlength')) {
      return `Mínimo ${field.errors!['minlength'].requiredLength} caracteres`;
    }
    return '';
  }
}

