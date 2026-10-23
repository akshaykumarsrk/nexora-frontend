import { Component, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { environment } from '../../../../environments/environment';

interface RegisterResponse {
  userId: number;
  username: string;
  role: string;
  organizationId: number;
  organizationName: string;
  message: string;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  readonly registerForm = this.fb.nonNullable.group({
    organizationName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
    username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
    password: ['', [Validators.required, Validators.minLength(12), Validators.maxLength(72)]],
    confirmPassword: ['', Validators.required]
  });

  onSubmit(): void {
    this.error.set(null);
    this.successMessage.set(null);

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const { organizationName, username, email, password, confirmPassword } = this.registerForm.getRawValue();
    if (password !== confirmPassword) {
      this.error.set('Passwords do not match.');
      return;
    }

    if (new TextEncoder().encode(password).length > 72) {
      this.error.set('Password must not exceed 72 bytes. Please use fewer special or non-English characters.');
      return;
    }

    this.loading.set(true);
    this.http.post<RegisterResponse>(`${environment.apiUrl}/auth/register`, {
      organizationName: organizationName.trim(),
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password
    }).pipe(finalize(() => this.loading.set(false))).subscribe({
      next: (response) => {
        this.successMessage.set(response?.message || 'Registration received. Please check your email to verify your account.');
        this.registerForm.reset();
      },
      error: (err: HttpErrorResponse) => {
        const serverMessage = this.readErrorMessage(err);
        this.error.set(serverMessage || 'Registration failed. Please check your details and try again.');
      }
    });
  }

  private readErrorMessage(error: HttpErrorResponse): string | null {
    const body: unknown = error.error;
    if (typeof body === 'string' && body.trim() && !/<(?:!doctype|html|head|body|script)\b/i.test(body)) {
      return body.trim();
    }
    if (body && typeof body === 'object') {
      const record = body as { message?: unknown; detail?: unknown; errors?: unknown };
      if (typeof record.message === 'string') return record.message;
      if (typeof record.detail === 'string') return record.detail;
      if (Array.isArray(record.errors)) return record.errors.filter(x => typeof x === 'string').join(' ');
    }
    if (error.status === 0) return 'Could not reach the NEXORA server. Please try again shortly.';
    if (error.status === 409) return 'This username or email may already be registered.';
    if (error.status === 400) return 'Some details are invalid. Check the form and try again.';
    return null;
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
