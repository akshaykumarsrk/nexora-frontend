import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-reset-password', standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ButtonModule, PasswordModule],
  templateUrl: './reset-password.html', styleUrl: './reset-password.css'
})
export class ResetPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly token = this.route.snapshot.queryParamMap.get('token') ?? '';
  readonly loading = signal(false);
  readonly message = signal<string | null>(null);
  readonly error = signal<string | null>(null);
  readonly form = this.fb.nonNullable.group({ password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(72)]], confirmPassword: ['', Validators.required] });

  submit(): void {
    if (!this.token) { this.error.set('This reset link is missing its token. Request a new link.'); return; }
    if (this.form.invalid || this.loading()) { this.form.markAllAsTouched(); return; }
    const { password, confirmPassword } = this.form.getRawValue();
    if (password !== confirmPassword) { this.error.set('Passwords do not match.'); return; }
    if (new TextEncoder().encode(password).length > 72) { this.error.set('Password is too long. Use at most 72 UTF-8 bytes.'); return; }
    this.loading.set(true); this.error.set(null); this.message.set(null);
    this.auth.resetPassword(this.token, password).subscribe({
      next: response => { this.message.set(response.message); this.loading.set(false); this.form.disable(); },
      error: (err: HttpErrorResponse) => {
        const body = err.error as { detail?: string; message?: string } | null;
        this.error.set(body?.detail ?? body?.message ?? 'This reset link is invalid or expired. Request a new one.');
        this.loading.set(false);
      }
    });
  }
}
