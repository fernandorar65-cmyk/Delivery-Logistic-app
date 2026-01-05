import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login-view.component.html',
  styleUrl: './login-view.component.css'
})
export class LoginViewComponent {
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  loading = signal(false);
  error = signal<string | null>(null);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  onSubmit() {
    if (this.loginForm.valid) {
      this.loading.set(true);
      this.error.set(null);

      const credentials = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      };

      this.authService.login(credentials).subscribe({
        next: (response) => {
          // Guardar tokens en localStorage
          if (response.access) {
            localStorage.setItem('access_token', response.access);
          }
          if (response.refresh) {
            localStorage.setItem('refresh_token', response.refresh);
          }
          
          // Redirigir a la página principal
          this.router.navigate(['/clients']);
        },
        error: (err) => {
          this.error.set('Credenciales inválidas. Por favor, verifica tu email y contraseña.');
          this.loading.set(false);
          console.error('Error en login:', err);
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
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

