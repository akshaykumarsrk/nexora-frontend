import { Component, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { environment } from '../../../../environments/environment';

type VerificationStatus = 'loading' | 'success' | 'error';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './verify-email.html',
  styleUrl: './verify-email.css'
})
export class VerifyEmail {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly status = signal<VerificationStatus>('loading');
  readonly message = signal('Verifying your email address...');
  readonly loading = signal(true);

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.status.set('error');
      this.message.set('The verification link is missing its token.');
      this.loading.set(false);
      return;
    }

    this.http.get(
      `${environment.apiUrl}/auth/verify-email`,
      {
        params: { token },
        responseType: 'text'
      }
    )
    .pipe(finalize(() => this.loading.set(false)))
    .subscribe({
      next: (response) => {
        // A Vercel SPA fallback can return index.html with HTTP 200 when
        // an API URL is misconfigured. Never treat HTML as verification success.
        const normalizedResponse = (response ?? '').trim();
        if (/<(?:!doctype\s+html|html|head|body|script|style)\b/i.test(normalizedResponse)) {
          this.status.set('error');
          this.message.set(
            'The verification service returned a webpage instead of an API response. Please contact support or try again later.'
          );
          return;
        }

        this.status.set('success');
        this.message.set(
          normalizedResponse || 'Your email has been verified successfully.'
        );
      },
      error: (error: HttpErrorResponse) => {
        this.status.set('error');

        if (error.status === 400) {
          this.message.set(
            'This verification link is invalid, expired, or already used.'
          );
        } else {
          this.message.set(
            'We could not verify your email right now. Please try again later.'
          );
        }
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}