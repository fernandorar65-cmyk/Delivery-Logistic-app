import { Component, inject, signal, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@app/core/auth/services/auth.service';
import { StorageService } from '@app/core/storage/storage.service';
import { LocalStorageEnums } from '@app/shared/models/local.storage.enums';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MessageModule } from 'primeng/message';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-login-view',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    InputTextModule,
    PasswordModule,
    CheckboxModule,
    ButtonModule,
    IconFieldModule,
    InputIconModule,
    MessageModule,
    CardModule,
    TagModule,
    DividerModule,
    TooltipModule
  ],
  templateUrl: './login-view.component.html',
  styleUrl: './login-view.component.css'
})
export class LoginViewComponent {
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private storageService = inject(StorageService);

  loading = signal(false);
  error = signal<string | null>(null);
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
          if (isPlatformBrowser(this.platformId)) {
            if (response.access) {
              this.storageService.setItem(LocalStorageEnums.ACCESS_TOKEN, response.access);
            }
            if (response.refresh) {
              this.storageService.setItem(LocalStorageEnums.REFRESH_TOKEN, response.refresh);
            }
            if (response.user_type) {
              this.storageService.setItem(LocalStorageEnums.USER_TYPE, response.user_type);
            }
            const emailToStore = credentials.email;
            if (emailToStore) {
              this.storageService.setItem(LocalStorageEnums.USER_EMAIL, emailToStore);
            }
          }
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.loading.set(false);
          if (err.status === 401 || err.status === 400) {
            this.error.set('Credenciales inválidas. Por favor, verifica tu email y contraseña.');
          } else if (err.status === 0) {
            this.error.set('Error de conexión. Por favor, verifica tu conexión a internet.');
          } else {
            this.error.set('Error al iniciar sesión. Por favor, intenta nuevamente.');
          }
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field?.hasError('required')) return 'Este campo es requerido';
    if (field?.hasError('email')) return 'Email inválido';
    if (field?.hasError('minlength')) return `Mínimo ${field.errors!['minlength'].requiredLength} caracteres`;
    return '';
  }
}







