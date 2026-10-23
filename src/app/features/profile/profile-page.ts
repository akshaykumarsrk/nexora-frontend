import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <main class="profile-page">
      <header class="page-heading">
        <div class="eyebrow"><i class="pi pi-user" aria-hidden="true"></i> ACCOUNT &amp; SECURITY</div>
        <h1>My Profile</h1>
        <p>Manage your sign-in security and review your workspace identity.</p>
      </header>

      <section class="profile-card account-card" aria-labelledby="account-heading">
        <div class="section-heading">
          <div class="avatar" aria-hidden="true">{{ initial() }}</div>
          <div class="heading-copy">
            <h2 id="account-heading">Account information</h2>
            <p>Your identity for this NEXORA workspace.</p>
          </div>
          <span class="account-status"><span></span> Signed in</span>
        </div>

        <div class="details-grid">
          <div class="detail">
            <span class="detail-label"><i class="pi pi-at" aria-hidden="true"></i> Username</span>
            <strong>{{ username() }}</strong>
          </div>
          <div class="detail">
            <span class="detail-label"><i class="pi pi-shield" aria-hidden="true"></i> Workspace role</span>
            <strong>{{ roleLabel() }}</strong>
          </div>
        </div>
        <div class="info-note">
          <i class="pi pi-info-circle" aria-hidden="true"></i>
          <p>Your account details and workspace access are managed securely according to your organization’s permissions.</p>
        </div>
      </section>

      <section class="profile-card security-card" aria-labelledby="security-heading">
        <div class="section-heading">
          <div class="section-icon"><i class="pi pi-lock" aria-hidden="true"></i></div>
          <div class="heading-copy">
            <h2 id="security-heading">Change password</h2>
            <p>Choose a unique password you do not use on other websites.</p>
          </div>
        </div>

        <form (ngSubmit)="changePassword()" #passwordForm="ngForm" novalidate>
          <div class="form-field">
            <label for="currentPassword">Current password</label>
            <input id="currentPassword" name="currentPassword" type="password" autocomplete="current-password" [(ngModel)]="currentPassword" required />
          </div>
          <div class="form-field">
            <label for="newPassword">New password</label>
            <input id="newPassword" name="newPassword" type="password" autocomplete="new-password" [(ngModel)]="newPassword" minlength="12" required />
            <small>Use at least 12 characters.</small>
          </div>
          <div class="form-field">
            <label for="confirmPassword">Confirm new password</label>
            <input id="confirmPassword" name="confirmPassword" type="password" autocomplete="new-password" [(ngModel)]="confirmPassword" minlength="12" required />
          </div>

          <p class="notice error" role="alert" *ngIf="error()"><i class="pi pi-exclamation-circle" aria-hidden="true"></i>{{ error() }}</p>
          <p class="notice success" role="status" *ngIf="success()"><i class="pi pi-check-circle" aria-hidden="true"></i>{{ success() }}</p>

          <div class="form-actions">
            <button type="submit" [disabled]="saving() || passwordForm.invalid">
              <i [class]="saving() ? 'pi pi-spin pi-spinner' : 'pi pi-shield'" aria-hidden="true"></i>
              {{ saving() ? 'Updating password…' : 'Update password' }}
            </button>
            <span class="secure-note"><i class="pi pi-lock" aria-hidden="true"></i> Sent securely to your workspace API</span>
          </div>
        </form>
      </section>
    </main>
  `,
  styles: [`
    :host{display:block;color:var(--nexora-text,#172033)}
    .profile-page{width:min(100%,1040px);box-sizing:border-box;margin:0 auto;padding:34px 28px 52px}
    .page-heading{margin-bottom:26px}.eyebrow{display:flex;align-items:center;gap:8px;font-size:11px;letter-spacing:.14em;font-weight:800;color:var(--nexora-primary,#625bff);margin-bottom:11px}
    .page-heading h1{font-size:clamp(27px,3vw,34px);line-height:1.15;letter-spacing:-.035em;margin:0 0 9px}.page-heading>p,.section-heading p{color:var(--nexora-text-muted,#68758d);margin:0;line-height:1.6}
    .profile-card{background:var(--nexora-surface,#fff);border:1px solid var(--nexora-border,#e2e7ef);border-radius:18px;padding:25px;margin-bottom:20px;box-shadow:0 5px 20px #17203308}
    .section-heading{display:flex;align-items:center;gap:14px;margin-bottom:23px;min-width:0}.heading-copy{min-width:0;flex:1}.section-heading h2{font-size:17px;letter-spacing:-.015em;margin:0 0 5px;font-weight:750}.section-heading p{font-size:13px}
    .avatar,.section-icon{width:48px;height:48px;flex:0 0 48px;border-radius:15px;display:grid;place-items:center;background:color-mix(in srgb,var(--nexora-primary,#625bff) 12%,var(--nexora-surface,#fff));color:var(--nexora-primary,#625bff);font-weight:800;font-size:19px}.section-icon{font-size:17px}
    .account-status{display:inline-flex;align-items:center;gap:7px;white-space:nowrap;padding:7px 10px;border:1px solid color-mix(in srgb,#16a36a 22%,var(--nexora-border,#e2e7ef));border-radius:999px;background:color-mix(in srgb,#16a36a 7%,var(--nexora-surface,#fff));color:var(--nexora-text,#172033);font-size:11px;font-weight:700}.account-status span{width:7px;height:7px;border-radius:50%;background:#16a36a}
    .details-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:15px}.detail{min-width:0;padding:17px;border-radius:12px;background:var(--nexora-surface-soft,#f6f8fc);border:1px solid var(--nexora-border,#e2e7ef);display:grid;gap:10px}.detail-label{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--nexora-text-muted,#68758d);font-weight:650}.detail-label i{color:var(--nexora-primary,#625bff)}.detail strong{font-size:14px;overflow-wrap:anywhere;font-weight:750}
    .info-note{display:flex;align-items:flex-start;gap:10px;margin-top:16px;padding:13px 14px;border:1px solid var(--nexora-border,#e2e7ef);border-radius:11px;color:var(--nexora-text-muted,#68758d)}.info-note>i{color:var(--nexora-primary,#625bff);margin-top:2px}.info-note p{font-size:12px;line-height:1.65;margin:0}
    form{display:grid;gap:17px;max-width:620px}.form-field{display:grid;gap:8px}.form-field label{font-size:12px;font-weight:750;color:var(--nexora-text,#172033)}.form-field input{width:100%;min-height:44px;box-sizing:border-box;padding:11px 13px;border:1px solid var(--nexora-border,#dce2ec);border-radius:10px;background:var(--nexora-surface-soft,#f8fafc);color:var(--nexora-text,#172033);font:inherit;font-size:13px;transition:border-color .16s ease,box-shadow .16s ease}.form-field input:focus{outline:0;border-color:var(--nexora-primary,#625bff);box-shadow:0 0 0 3px color-mix(in srgb,var(--nexora-primary,#625bff) 14%,transparent)}.form-field small{font-size:11px;color:var(--nexora-text-muted,#68758d)}
    .form-actions{display:flex;align-items:center;gap:15px;flex-wrap:wrap;margin-top:2px}button{display:inline-flex;align-items:center;justify-content:center;gap:9px;min-height:43px;border:0;border-radius:10px;padding:0 17px;background:var(--nexora-primary,#625bff);color:#fff;font:inherit;font-size:12px;font-weight:750;cursor:pointer;box-shadow:0 5px 12px color-mix(in srgb,var(--nexora-primary,#625bff) 20%,transparent);transition:transform .16s ease,filter .16s ease,box-shadow .16s ease}button:hover:not(:disabled){filter:brightness(1.05);transform:translateY(-1px);box-shadow:0 8px 18px color-mix(in srgb,var(--nexora-primary,#625bff) 25%,transparent)}button:focus-visible{outline:3px solid color-mix(in srgb,var(--nexora-primary,#625bff) 35%,transparent);outline-offset:2px}button:disabled{opacity:.55;cursor:not-allowed;box-shadow:none}.secure-note{display:inline-flex;align-items:center;gap:6px;color:var(--nexora-text-muted,#68758d);font-size:11px}.notice{display:flex;align-items:flex-start;gap:9px;padding:11px 13px;border-radius:9px;font-size:12px;line-height:1.5;margin:0}.error{background:color-mix(in srgb,#d92d20 9%,var(--nexora-surface,#fff));color:var(--nexora-danger,#b42318);border:1px solid color-mix(in srgb,#d92d20 18%,var(--nexora-border,#e2e7ef))}.success{background:color-mix(in srgb,#079455 9%,var(--nexora-surface,#fff));color:#067647;border:1px solid color-mix(in srgb,#079455 18%,var(--nexora-border,#e2e7ef))}
    @media(max-width:640px){.profile-page{padding:24px 16px 36px}.profile-card{padding:18px}.section-heading{align-items:flex-start;flex-wrap:wrap}.account-status{margin-left:62px}.details-grid{grid-template-columns:1fr}.form-actions{align-items:flex-start;flex-direction:column}.secure-note{line-height:1.5}}
    @media(prefers-reduced-motion:reduce){button,.form-field input{transition:none}}
  `]
})
export class ProfilePage {
  private readonly auth = inject(AuthService);

  readonly username = signal(this.auth.getUsername() ?? '—');
  readonly role = signal(this.auth.getRole() ?? 'USER');
  readonly initial = signal((this.username().trim()[0] ?? 'U').toUpperCase());
  readonly roleLabel = signal(this.role().replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, letter => letter.toUpperCase()));

  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  readonly saving = signal(false);
  readonly error = signal('');
  readonly success = signal('');

  changePassword(): void {
    this.error.set('');
    this.success.set('');

    if (this.newPassword !== this.confirmPassword) {
      this.error.set('The new passwords do not match.');
      return;
    }
    if (new TextEncoder().encode(this.newPassword).length > 72) {
      this.error.set('The new password must not exceed 72 UTF-8 bytes.');
      return;
    }
    if (this.newPassword === this.currentPassword) {
      this.error.set('Choose a new password different from your current password.');
      return;
    }

    this.saving.set(true);
    this.auth.changeOwnPassword({ currentPassword: this.currentPassword, newPassword: this.newPassword }).subscribe({
      next: () => {
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        this.success.set('Your password has been updated successfully.');
        this.saving.set(false);
      },
      error: err => {
        this.error.set(err?.error?.message ?? 'Unable to update your password. Check your current password and try again.');
        this.saving.set(false);
      }
    });
  }
}
