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
        <div class="eyebrow">ACCOUNT & SECURITY</div>
        <h1>My profile</h1>
        <p>Review your account and manage your sign-in password.</p>
      </header>

      <section class="profile-card account-card">
        <div class="section-heading"><div class="avatar">{{ initial() }}</div><div><h2>Account information</h2><p>Your current signed-in account details.</p></div></div>
        <div class="details-grid">
          <div class="detail"><span>Username</span><strong>{{ username() }}</strong></div>
          <div class="detail"><span>Role</span><strong>{{ role() }}</strong></div>
        </div>
        <p class="hint">Your username and role are managed by your organization administrator. Contact them if either needs to change.</p>
      </section>

      <section class="profile-card">
        <div class="section-heading"><div class="section-icon pi pi-lock"></div><div><h2>Change password</h2><p>Use a unique password that you don't use elsewhere.</p></div></div>
        <form (ngSubmit)="changePassword()" #passwordForm="ngForm">
          <label for="currentPassword">Current password</label>
          <input id="currentPassword" name="currentPassword" type="password" autocomplete="current-password" [(ngModel)]="currentPassword" required />
          <label for="newPassword">New password</label>
          <input id="newPassword" name="newPassword" type="password" autocomplete="new-password" [(ngModel)]="newPassword" minlength="12" required />
          <label for="confirmPassword">Confirm new password</label>
          <input id="confirmPassword" name="confirmPassword" type="password" autocomplete="new-password" [(ngModel)]="confirmPassword" minlength="12" required />
          <p class="notice error" *ngIf="error()">{{ error() }}</p>
          <p class="notice success" *ngIf="success()">{{ success() }}</p>
          <button type="submit" [disabled]="saving() || passwordForm.invalid">{{ saving() ? 'Updating…' : 'Update password' }}</button>
        </form>
      </section>
    </main>
  `,
  styles: [`
    :host{display:block;color:var(--nexora-text,#172033)}.profile-page{max-width:1000px;margin:0 auto;padding:34px 28px 48px}.page-heading{margin-bottom:24px}.eyebrow{font-size:12px;letter-spacing:.14em;font-weight:800;color:var(--nexora-primary,#625bff);margin-bottom:10px}.page-heading h1{font-size:30px;margin:0 0 8px;font-weight:800}.page-heading p,.section-heading p{color:var(--nexora-text-muted,#68758d);margin:0}.profile-card{background:var(--nexora-surface,#fff);border:1px solid var(--nexora-border,#e2e7ef);border-radius:18px;padding:24px;margin-bottom:20px;box-shadow:0 4px 14px #1720330a}.section-heading{display:flex;align-items:center;gap:14px;margin-bottom:24px}.section-heading h2{font-size:18px;margin:0 0 5px}.avatar,.section-icon{width:46px;height:46px;border-radius:14px;display:grid;place-items:center;background:#625bff18;color:var(--nexora-primary,#625bff);font-weight:800;font-size:20px}.details-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.detail{padding:16px;border-radius:12px;background:var(--nexora-surface-soft,#f6f8fc);display:grid;gap:7px}.detail span{font-size:12px;color:var(--nexora-text-muted,#68758d)}.detail strong{overflow-wrap:anywhere}.hint{font-size:13px;color:var(--nexora-text-muted,#68758d);margin:16px 0 0}form{display:grid;gap:9px;max-width:560px}label{font-size:13px;font-weight:700;margin-top:6px}input{width:100%;box-sizing:border-box;padding:12px 14px;border:1px solid var(--nexora-border,#dce2ec);border-radius:10px;background:var(--nexora-surface-soft,#f8fafc);color:inherit;font:inherit}input:focus{outline:2px solid #625bff55;border-color:#625bff}button{justify-self:start;margin-top:10px;border:0;border-radius:10px;padding:12px 18px;background:var(--nexora-primary,#625bff);color:white;font-weight:700;cursor:pointer}button:disabled{opacity:.55;cursor:not-allowed}.notice{padding:11px 13px;border-radius:9px;font-size:13px}.error{background:#fff0f0;color:#b42318}.success{background:#eafaf2;color:#067647}@media(max-width:640px){.profile-page{padding:24px 16px}.profile-card{padding:18px}.details-grid{grid-template-columns:1fr}.page-heading h1{font-size:26px}}
  `]
})
export class ProfilePage {
  private readonly auth = inject(AuthService);
  readonly username = signal(this.auth.getUsername() ?? '—');
  readonly role = signal(this.auth.getRole() ?? 'USER');
  readonly initial = signal((this.username().trim()[0] ?? 'U').toUpperCase());
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  readonly saving = signal(false);
  readonly error = signal('');
  readonly success = signal('');

  changePassword(): void {
    this.error.set(''); this.success.set('');
    if (this.newPassword !== this.confirmPassword) { this.error.set('The new passwords do not match.'); return; }
    if (new TextEncoder().encode(this.newPassword).length > 72) { this.error.set('The new password must not exceed 72 UTF-8 bytes.'); return; }
    if (this.newPassword === this.currentPassword) { this.error.set('Choose a new password different from your current password.'); return; }
    this.saving.set(true);
    this.auth.changeOwnPassword({ currentPassword: this.currentPassword, newPassword: this.newPassword }).subscribe({
      next: () => { this.currentPassword = ''; this.newPassword = ''; this.confirmPassword = ''; this.success.set('Your password has been updated successfully.'); this.saving.set(false); },
      error: err => { this.error.set(err?.error?.message ?? 'Unable to update your password. Check your current password and try again.'); this.saving.set(false); }
    });
  }
}
