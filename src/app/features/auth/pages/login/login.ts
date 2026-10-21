import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password'

import { AuthService } from '../../../../core/services/auth';
import { Router, RouterLink } from '@angular/router';

@Component({
  imports: [ReactiveFormsModule, ButtonModule, InputTextModule, PasswordModule, RouterLink],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {

  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly loginForm = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  onSubmit(): void {

    if(this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.authService.login(this.loginForm.getRawValue()).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate([this.authService.getRole() === 'TECHNICIAN' ? '/technician-dashboard' : '/dashboard']);
      },

      error: (error) => {
        console.error('Login failed:', error);

        this.loading.set(false);

        this.error.set(
          error?.error?.message?? 'Invalid username or password.'
        );
      }
    });
  }
}
