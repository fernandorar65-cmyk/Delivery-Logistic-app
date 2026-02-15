import {
  Component,
  Input,
  inject,
  Injector,
  forwardRef,
  signal,
  ChangeDetectionStrategy,
  AfterViewInit
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  NgControl,
  ValidationErrors
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HeroIconComponent } from '@app/shared/ui/hero-icon/hero-icon';

@Component({
  selector: 'app-password-confirm',
  standalone: true,
  imports: [CommonModule, HeroIconComponent],
  templateUrl: './password-confirm.component.html',
  styleUrl: './password-confirm.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PasswordConfirmComponent),
      multi: true
    }
  ]
})
export class PasswordConfirmComponent implements ControlValueAccessor, AfterViewInit {
  @Input() required = true;
  @Input() minLength = 6;
  @Input() placeholder = 'Ingrese la contraseña';
  @Input() confirmPlaceholder = 'Repita la contraseña para confirmar';
  @Input() optionalLabel = '(opcional - dejar en blanco para no cambiar)';
  @Input() passwordLabel = 'Contraseña';
  @Input() confirmLabel = 'Confirmar contraseña';

  readonly passwordId = 'pwd-' + Math.random().toString(36).slice(2, 9);
  readonly confirmId = 'confirm-pwd-' + Math.random().toString(36).slice(2, 9);

  passwordValue = signal('');
  confirmPasswordValue = signal('');
  disabled = signal(false);
  touched = signal(false);
  showPassword = signal(false);
  showConfirm = signal(false);

  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }

  toggleConfirmVisibility(): void {
    this.showConfirm.update(v => !v);
  }

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  private injector = inject(Injector);
  private ngControl: NgControl | null = null;

  ngAfterViewInit(): void {
    try {
      this.ngControl = this.injector.get(NgControl, null, { optional: true }) ?? null;
    } catch {
      this.ngControl = null;
    }
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
    this.triggerValidation();
  }

  private get control() {
    return this.ngControl?.control ?? null;
  }

  onPasswordInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.passwordValue.set(value);
    this.emitValue();
  }

  onConfirmInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.confirmPasswordValue.set(value);
    this.emitValue();
  }

  onBlur(): void {
    this.touched.set(true);
    this.onTouched();
    this.triggerValidation();
  }

  private emitValue(): void {
    const password = this.passwordValue();
    const confirm = this.confirmPasswordValue();
    const errors = this.getValidationErrors(password, confirm);

    if (!errors) {
      this.onChange(password);
      this.control?.setErrors(null);
      return;
    }

    this.onChange('');
    this.control?.setErrors(errors);
  }

  private triggerValidation(): void {
    const password = this.passwordValue();
    const confirm = this.confirmPasswordValue();
    const errors = this.getValidationErrors(password, confirm);
    this.control?.setErrors(errors);
  }

  private getValidationErrors(password: string, confirm: string): ValidationErrors | null {
    if (!this.required && !password && !confirm) {
      return null;
    }

    if (this.required && (!password || !confirm)) {
      return { required: true };
    }

    if (password && password.length < this.minLength) {
      return {
        minlength: {
          requiredLength: this.minLength,
          actualLength: password.length
        }
      };
    }

    if (password !== confirm) {
      return { passwordMismatch: true };
    }

    return null;
  }

  writeValue(value: string | null): void {
    const v = value ?? '';
    this.passwordValue.set(v);
    this.confirmPasswordValue.set(v);
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  getError(): string {
    const control = this.control;
    if (!control?.invalid || !control?.touched) {
      return '';
    }
    const errors = control.errors;
    if (!errors) return '';
    if (errors['required']) return 'Este campo es requerido';
    if (errors['passwordMismatch']) return 'Las contraseñas no coinciden';
    if (errors['minlength']) {
      return `Mínimo ${errors['minlength'].requiredLength ?? this.minLength} caracteres`;
    }
    return '';
  }

  isPasswordInvalid(): boolean {
    const control = this.control;
    return Boolean(control?.invalid && control?.touched);
  }

  isConfirmInvalid(): boolean {
    const control = this.control;
    const errors = control?.errors;
    return Boolean(
      control?.touched &&
        (control?.invalid || errors?.['passwordMismatch'])
    );
  }
}
