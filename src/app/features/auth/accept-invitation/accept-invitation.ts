
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs';

import { environment } from '../../../../environments/environment';

interface AcceptInvitationResponse {
  message: string;
}

@Component({
  selector: 'app-accept-invitation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './accept-invitation.html',
  styleUrl: './accept-invitation.css'
})
export class AcceptInvitationComponent {
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  private readonly token =
    this.route.snapshot.queryParamMap.get('token') ?? '';

  readonly form = this.fb.nonNullable.group({
    password: ['', [
      Validators.required,
      Validators.minLength(12),
      Validators.maxLength(72)
    ]],
    confirmPassword: ['', Validators.required]
  });

  submit(): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    if (!this.token) {
      this.errorMessage.set(
        'Invitation token is missing. Please open the complete link from your email.'
      );
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { password, confirmPassword } = this.form.getRawValue();

    if (password !== confirmPassword) {
      this.errorMessage.set('Passwords do not match.');
      return;
    }

    this.loading.set(true);

    this.http.post<AcceptInvitationResponse>(
      `${environment.apiUrl}/auth/accept-invitation`,
      {
        token: this.token,
        password,
        confirmPassword
      }
    ).pipe(
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: (response) => {
        this.successMessage.set(
          response.message || 'Account activated successfully.'
        );
        this.form.reset();

        // Navigate to login after the success message is shown.
        setTimeout(() => {
          void this.router.navigate(['/login'], {
            queryParams: { invitationAccepted: true }
          });
        }, 1200);
      },
      error: (error) => {
        this.errorMessage.set(
          error?.error?.message ??
          'Unable to accept this invitation. It may have expired or already been used.'
        );
      }
    });
  }
}
