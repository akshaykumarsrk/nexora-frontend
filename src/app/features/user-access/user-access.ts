import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { environment } from '../../../environments/environment';
import { TechnicianService } from '../technicians/services/technician';
import { Technician } from '../technicians/models/technician';

interface UserRow {
  id: number;
  username: string;
  email: string;
  role: string;
  enabled: boolean;
}

@Component({
  selector: 'app-user-access',
  standalone: true,
  imports: [CommonModule, FormsModule],

  template: `
    <main class="nx-page access-page">
      <header class="heading">
        <div>
          <p class="eyebrow">SECURITY & TEAM</p>
          <h1>User access</h1>
          <p>
            Invite teammates to this organization and assign their starting
            role.
          </p>
        </div>

        <button
          class="primary"
          type="button"
          (click)="showInvite.set(!showInvite())"
        >
          {{ showInvite() ? 'Close invitation' : 'Invite user' }}
        </button>
      </header>

      @if (error()) {
        <p class="feedback error" role="alert">
          {{ error() }}
        </p>
      }

      @if (success()) {
        <p class="feedback success" role="status">
          {{ success() }}
        </p>
      }

      @if (showInvite()) {
        <form class="panel invite-form" (ngSubmit)="invite()">
          <h2>Invite a teammate</h2>

          <div class="fields">
            <label>
              Work email
              <input
                name="email"
                type="email"
                required
                maxlength="254"
                [(ngModel)]="email"
                placeholder="person@company.com"
              />
            </label>

            <label>
              Username
              <input
                name="username"
                required
                maxlength="100"
                [(ngModel)]="username"
                placeholder="username"
              />
            </label>

            <label>
              Role
              <select
                name="role"
                [(ngModel)]="role"
                (ngModelChange)="onRoleChange()"
              >
                <option value="ADMIN">Admin</option>
                <option value="MANAGER">Manager</option>
                <option value="STAFF">Staff</option>
                <option value="TECHNICIAN">Technician</option>
              </select>
            </label>

            <label *ngIf="role === 'TECHNICIAN'">
              Technician profile

              <select
                name="technicianId"
                required
                [(ngModel)]="technicianId"
              >
                <option [ngValue]="null" disabled>
                  Select an active technician
                </option>

                <option
                  *ngFor="let technician of availableTechnicians()"
                  [ngValue]="technician.id"
                >
                  {{ technician.name }} · #{{ technician.id
                  }}{{ technician.employeeCode
                    ? ' · ' + technician.employeeCode
                    : '' }}
                </option>
              </select>
            </label>
          </div>

          <p
            *ngIf="role === 'TECHNICIAN' && techniciansLoading()"
            class="state"
          >
            Loading technician profiles…
          </p>

          <p
            *ngIf="
              role === 'TECHNICIAN' &&
              !techniciansLoading() &&
              availableTechnicians().length === 0
            "
            class="feedback error"
            role="alert"
          >
            No active technician profiles are available to invite. Create an
            active profile first, or check whether existing profiles are
            already linked to user accounts.
          </p>

          <p class="notice">
            <i class="pi pi-info-circle"></i>

            <span>
              The invitee receives an email invitation and sets their own
              password. Technician invitations must be linked to an existing
              active technician profile in this organization.
            </span>
          </p>

          <button class="primary" type="submit" [disabled]="saving()">
            {{ saving() ? 'Sending…' : 'Send invitation' }}
          </button>
        </form>
      }

      <section class="panel">
        <div class="panel-title">
          <div>
            <h2>Organization users</h2>
            <p>Current accounts and their assigned roles.</p>
          </div>

          <button class="secondary" type="button" (click)="load()">
            Refresh
          </button>
        </div>

        @if (loading()) {
          <p class="state">Loading users…</p>
        } @else if (users().length) {
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                @for (user of users(); track user.id) {
                  <tr>
                    <td>{{ user.username }}</td>
                    <td>{{ user.email }}</td>

                    <td>
                      <span class="role">
                        {{ user.role }}
                      </span>
                    </td>

                    <td>
                      <span
                        [class.enabled]="user.enabled"
                        [class.disabled]="!user.enabled"
                      >
                        {{ user.enabled ? 'Active' : 'Disabled' }}
                      </span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else {
          <div class="empty">
            <i class="pi pi-users"></i>

            <strong>No users returned</strong>

            <span>
              If you are an Admin, refresh the list. Other roles cannot view
              user administration.
            </span>
          </div>
        }
      </section>
    </main>
  `,

  styles: [
    `
      :host {
        display: block;
        color: var(--nexora-text, #172033);
      }

      .access-page {
        max-width: 1200px;
        margin: auto;
        padding: 30px;
      }

      .heading,
      .panel-title {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 18px;
      }

      .eyebrow {
        font-size: 0.74rem;
        letter-spacing: 0.13em;
        font-weight: 800;
        color: var(--nexora-primary, #6366f1);
      }

      h1 {
        margin: 8px 0;
        font-size: 2rem;
        letter-spacing: -0.03em;
      }

      .heading p:not(.eyebrow),
      .panel-title p {
        color: var(--nexora-text-muted, #64748b);
        margin: 0;
      }

      .panel {
        margin-top: 22px;
        background: var(--nexora-surface, #fff);
        border: 1px solid var(--nexora-border, #e2e8f0);
        border-radius: 16px;
        padding: 22px;
        box-shadow: var(
          --nexora-shadow-sm,
          0 2px 8px #1720330a
        );
      }

      h2 {
        font-size: 1.15rem;
        margin: 0 0 5px;
      }

      .fields {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 16px;
        margin: 20px 0;
      }

      .fields label {
        display: grid;
        gap: 8px;
        font-size: 0.88rem;
        font-weight: 700;
      }

      .fields input,
      .fields select {
        width: 100%;
        min-width: 0;
        border: 1px solid var(--nexora-border, #dce2ee);
        border-radius: 10px;
        padding: 12px;
        background: var(
          --nexora-surface-soft,
          var(--nexora-surface, #fff)
        );
        color: var(--nexora-text, #172033);
        font: inherit;
        color-scheme: light;
      }

      :host-context(html.dark) .fields input,
      :host-context(html.dark) .fields select {
        background: var(--nexora-surface-soft, #172033);
        color: var(--nexora-text, #f8fafc);
        border-color: var(--nexora-border, #263244);
        color-scheme: dark;
      }

      :host-context(html.dark) .fields select option {
        background: var(--nexora-surface, #111827);
        color: var(--nexora-text, #f8fafc);
      }

      .fields input::placeholder {
        color: var(--nexora-text-muted, #64748b);
        opacity: 1;
      }

      .fields input:focus,
      .fields select:focus {
        outline: 2px solid var(--nexora-primary, #6366f1);
        outline-offset: 2px;
      }

      .primary,
      .secondary {
        border: 0;
        border-radius: 10px;
        padding: 11px 15px;
        font: inherit;
        font-weight: 700;
        cursor: pointer;
        transition:
          transform 0.2s ease,
          filter 0.2s ease;
      }

      .primary {
        background: var(--nexora-primary, #6366f1);
        color: #fff;
      }

.secondary {
  background: var(--nexora-surface-hover, #f1f3f9);
  color: var(--nexora-text, #172033);

  border: 1px solid var(--nexora-border, #e2e8f0);
  border-radius: 10px;

  padding: 11px 15px;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

/* Dark mode */
:host-context(html.dark) .secondary {
  background: var(--nexora-surface-hover, #1e293b);
  color: var(--nexora-text, #f8fafc);
  border-color: var(--nexora-border, #334155);
}

/* Hover effects */
.secondary:hover:not(:disabled) {
  background: var(--nexora-surface, #ffffff);
  border-color: var(--nexora-primary, #6366f1);
}

:host-context(html.dark) .secondary:hover:not(:disabled) {
  background: var(--nexora-surface, #111827);
  border-color: var(--nexora-primary, #818cf8);
}

.secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

      button:hover:not(:disabled) {
        filter: brightness(0.97);
        transform: translateY(-1px);
      }

      button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

    .notice {
    display: flex;
    gap: 10px;
    line-height: 1.6;

    color: var(--nexora-text-muted, #64748b);
    background: var(--nexora-surface-hover, #f7f8ff);

    padding: 12px;
    border: 1px solid var(--nexora-border, #e2e8f0);
    border-radius: 10px;

    }

    .notice i {
    color: var(--nexora-primary, #6366f1);
    flex-shrink: 0;
    margin-top: 3px;
    }

    /* Dark mode */
    :host-context(html.dark) .notice {
    background: var(--nexora-surface-hover, #1e293b);
    color: var(--nexora-text-muted, #cbd5e1);
    border-color: var(--nexora-border, #334155);
    }

    :host-context(html.dark) .notice i {
    color: var(--nexora-primary, #818cf8);
    }

      .panel-title {
        margin-bottom: 16px;
      }

      .table-wrap {
        overflow: auto;
      }

      table {
        width: 100%;
        border-collapse: collapse;
      }

      th,
      td {
        text-align: left;
        padding: 14px 12px;
        border-bottom: 1px solid var(--nexora-border, #e2e8f0);
        font-size: 0.9rem;
      }

      th {
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--nexora-text-muted, #64748b);
      }

      .role {
        display: inline-flex;
        padding: 5px 9px;
        border-radius: 99px;
        background: var(--nexora-primary-soft, #efefff);
        color: var(--nexora-primary, #6366f1);
        font-size: 0.76rem;
        font-weight: 750;
      }

      .enabled {
        color: #027a48;
      }

      .disabled {
        color: #b42318;
      }

      .feedback {
        padding: 12px 14px;
        border-radius: 10px;
      }

      .error {
        background: #fff1f2;
        color: #b42318;
      }

      .success {
        background: #ecfdf3;
        color: #027a48;
      }

      .state,
      .empty {
        text-align: center;
        padding: 34px;
        color: var(--nexora-text-muted, #64748b);
      }

      .empty {
        display: grid;
        justify-items: center;
        gap: 8px;
      }

      .empty i {
        font-size: 1.8rem;
        color: var(--nexora-primary, #6366f1);
      }

      .empty span {
        font-size: 0.88rem;
      }

      @media (max-width: 650px) {
        .access-page {
          padding: 20px 14px;
        }

        .heading,
        .panel-title {
          align-items: flex-start;
          flex-direction: column;
        }

        .fields {
          grid-template-columns: 1fr;
        }

        .panel {
          padding: 16px;
        }
      }
    `,
  ],
})
export class UserAccess {
  private readonly http = inject(HttpClient);
  private readonly technicianService = inject(TechnicianService);

  readonly users = signal<UserRow[]>([]);
  readonly availableTechnicians = signal<Technician[]>([]);

  readonly techniciansLoading = signal(false);
  readonly loading = signal(false);
  readonly saving = signal(false);

  readonly error = signal('');
  readonly success = signal('');
  readonly showInvite = signal(false);

  email = '';
  username = '';
  role = 'TECHNICIAN';
  technicianId: number | null = null;

  private readonly url = `${environment.apiUrl}/users`;

  constructor() {
    this.load();
    this.loadAvailableTechnicians();
  }

  loadAvailableTechnicians(): void {
    this.techniciansLoading.set(true);

    this.technicianService.getAllTechnicians().subscribe({
      next: (technicians) => {
        this.availableTechnicians.set(
          (technicians ?? []).filter(
            (technician) =>
              String(technician.status).toUpperCase() === 'ACTIVE' &&
              technician.hasLoginAccount !== true
          )
        );

        this.techniciansLoading.set(false);
      },

      error: () => {
        this.availableTechnicians.set([]);
        this.techniciansLoading.set(false);
      },
    });
  }

  onRoleChange(): void {
    if (this.role !== 'TECHNICIAN') {
      this.technicianId = null;
    }
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');

    this.http.get<UserRow[]>(this.url).subscribe({
      next: (response) => {
        this.users.set(response);
        this.loading.set(false);
      },

      error: (error) => {
        this.loading.set(false);

        this.error.set(
          error?.error?.message ??
            'Only an administrator can view user access.'
        );
      },
    });
  }

  invite(): void {
    this.error.set('');
    this.success.set('');

    if (!this.email.trim() || !this.username.trim()) {
      this.error.set('Enter an email and username.');
      return;
    }

    if (
      this.role === 'TECHNICIAN' &&
      (!this.technicianId || this.technicianId <= 0)
    ) {
      this.error.set(
        'Select an active technician profile before sending this invitation.'
      );
      return;
    }

    this.saving.set(true);

    const body: {
      email: string;
      username: string;
      role: string;
      technicianId?: number;
    } = {
      email: this.email.trim(),
      username: this.username.trim(),
      role: this.role,
    };

    if (this.role === 'TECHNICIAN') {
      body.technicianId = this.technicianId!;
    }

    this.http
      .post(`${environment.apiUrl}/users/invitations`, body)
      .subscribe({
        next: () => {
          this.success.set(
            'Invitation sent. The user will set their password when accepting.'
          );

          this.email = '';
          this.username = '';
          this.technicianId = null;

          this.saving.set(false);
          this.showInvite.set(false);

          this.load();
          this.loadAvailableTechnicians();
        },

        error: (error) => {
          this.error.set(
            error?.error?.message ??
              'Invitation could not be sent. Check the role and email configuration.'
          );

          this.saving.set(false);
        },
      });
  }
}