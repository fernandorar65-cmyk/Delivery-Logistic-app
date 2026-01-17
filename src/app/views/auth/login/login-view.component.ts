import { Component, inject, signal, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { HeroIconComponent } from '../../../components/hero-icon/hero-icon';

@Component({
  selector: 'app-login-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HeroIconComponent],
  templateUrl: './login-view.component.html',
  styleUrl: './login-view.component.css'
})
export class LoginViewComponent {
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  loading = signal(false);
  error = signal<string | null>(null);
  showPassword = signal(false);
  rememberMe = signal(false);

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
          // Guardar tokens en localStorage solo si estamos en el navegador
          if (isPlatformBrowser(this.platformId)) {
            if (response.access) {
              localStorage.setItem('access_token', response.access);
            }
            if (response.refresh) {
              localStorage.setItem('refresh_token', response.refresh);
            }
            if (response.user_type) {
              localStorage.setItem('user_type', response.user_type);
            }
          }
          
          // Redirigir al dashboard
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.loading.set(false);
          
          // Manejar diferentes tipos de errores
          if (err.status === 401 || err.status === 400) {
            this.error.set('Credenciales inválidas. Por favor, verifica tu email y contraseña.');
          } else if (err.status === 0) {
            this.error.set('Error de conexión. Por favor, verifica tu conexión a internet.');
          } else {
            this.error.set('Error al iniciar sesión. Por favor, intenta nuevamente.');
          }
          
          console.error('Error en login:', err);
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  togglePasswordVisibility() {
    this.showPassword.set(!this.showPassword());
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

