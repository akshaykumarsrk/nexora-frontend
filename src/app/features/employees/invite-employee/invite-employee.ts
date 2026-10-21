
import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs';

import { environment } from '../../../../environments/environment';

interface TechnicianOption {
  id: number;
  name: string;
  status: string;
}

interface InvitationResponse {
  message: string;
  expiresAt: string;
}

@Component({
  selector: 'app-invite-employee',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './invite-employee.html',
  styleUrl: './invite-employee.css'
})
export class InviteEmployeeComponent {
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);

  readonly technicians = signal<TechnicianOption[]>([]);
  readonly loading = signal(false);
  readonly loadingTechnicians = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
    username: ['', [
      Validators.required,
      Validators.maxLength(100),
      Validators.pattern(/^[A-Za-z0-9._@-]+$/)
    ]],
    role: ['STAFF', Validators.required],
    technicianId: [0]
  });

  constructor() {
    this.form.controls.role.valueChanges.subscribe(role => {
      this.form.controls.technicianId.setValue(0);
      this.form.controls.technicianId.clearValidators();

      if (role === 'TECHNICIAN') {
        this.form.controls.technicianId.setValidators([
          Validators.required,
          Validators.min(1)
        ]);
        this.loadTechnicians();
      }

      this.form.controls.technicianId.updateValueAndValidity();
    });
  }

  loadTechnicians(): void {
    if (this.technicians().length || this.loadingTechnicians()) {
      return;
    }

    this.loadingTechnicians.set(true);

    this.http.get<TechnicianOption[]>(
      `${environment.apiUrl}/technicians`
    ).pipe(
      finalize(() => this.loadingTechnicians.set(false))
    ).subscribe({
      next: result => this.technicians.set(
        result.filter(t => t.status?.toUpperCase() === 'ACTIVE')
      ),
      error: () => this.errorMessage.set(
        'Unable to load technician profiles.'
      )
    });
  }

  submit(): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    const payload = {
      email: value.email.trim().toLowerCase(),
      username: value.username.trim(),
      role: value.role,
      ...(value.role === 'TECHNICIAN'
        ? { technicianId: value.technicianId }
        : {})
    };

    this.loading.set(true);

    this.http.post<InvitationResponse>(
      `${environment.apiUrl}/users/invitations`,
      payload
    ).pipe(
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: response => {
        this.successMessage.set(
          `${response.message}. Invitation expires in 24 hours.`
        );
        this.form.reset({
          email: '',
          username: '',
          role: 'STAFF',
          technicianId: 0
        });
      },
      error: error => this.errorMessage.set(
        error?.error?.message ?? 'Unable to send employee invitation.'
      )
    });
  }
}
